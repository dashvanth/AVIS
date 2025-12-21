# backend/app/api/endpoints/datasets.py
from typing import List
import os
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.dataset import Dataset
from app.services.dataset_service import process_uploaded_file, analyze_file_preview

router = APIRouter()

@router.post("/upload", response_model=Dataset)
async def upload_dataset(
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """
    Handles multi-format uploads (CSV, Excel, JSON, XML) and returns 
    the dataset with the newly implemented transparency 'processing_log'.
    """
    try:
        # Calling the service to handle disk I/O and MySQL persistence
        dataset = process_uploaded_file(file, session)
        return dataset
    except Exception as e:
        # Log the detailed error to your terminal for Task 2.1 debugging
        print(f"CRITICAL UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preview")
async def preview_dataset_endpoint(
    file: UploadFile = File(...)
):
    """
    Provides an immediate orientation summary before final upload.
    This fulfills the 'Automatic Orientation' requirement.
    """
    try:
        return analyze_file_preview(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Preview Orientation Failed: {str(e)}")

@router.get("/", response_model=List[Dataset])
def read_datasets(session: Session = Depends(get_session)):
    """Retrieves all datasets registered in MySQL."""
    return session.exec(select(Dataset)).all()

@router.get("/{dataset_id}", response_model=Dataset)
def read_dataset(dataset_id: int, session: Session = Depends(get_session)):
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: int, session: Session = Depends(get_session)):
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # 1. Clean up file from disk before removing DB entry
    if os.path.exists(dataset.filepath):
        try:
            os.remove(dataset.filepath)
        except Exception as e:
            print(f"File deletion warning: {e}")

    session.delete(dataset)
    session.commit()
    return {"ok": True}

@router.get("/{dataset_id}/preview")
def preview_existing_dataset(dataset_id: int, session: Session = Depends(get_session)):
    """
    Retrieves preview data and transparency logs for existing datasets.
    Supports radical transparency by returning the 'processing_log'.
    """
    dataset = session.get(Dataset, dataset_id)
    if not dataset or not dataset.filepath:
        raise HTTPException(status_code=404, detail="Dataset or file not found")
    
    if not os.path.exists(dataset.filepath):
         raise HTTPException(status_code=404, detail=f"File missing at path")

    try:
        import pandas as pd
        import numpy as np

        # Support for multi-format reading (Requirement #1)
        if dataset.file_type == 'csv':
            try:
                df = pd.read_csv(dataset.filepath, nrows=100)
            except UnicodeDecodeError:
                df = pd.read_csv(dataset.filepath, nrows=100, encoding='latin-1')
        elif dataset.file_type in ['xlsx', 'xls']:
            df = pd.read_excel(dataset.filepath, nrows=100)
        elif dataset.file_type == 'json':
            df = pd.read_json(dataset.filepath).head(100)
        elif dataset.file_type == 'xml':
            df = pd.read_xml(dataset.filepath).head(100)
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
        
        # Sanitize data for JSON response (NaN/Inf to None)
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        df = df.where(pd.notnull(df), None)
        
        return {
            "columns": list(df.columns),
            "data": df.to_dict(orient="records"),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "processing_log": dataset.processing_log # Crucial for Task 2.1 Transparency
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")