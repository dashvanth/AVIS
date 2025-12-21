from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.dataset import Dataset
from app.services.dataset_service import process_uploaded_file

router = APIRouter()

@router.post("/upload", response_model=Dataset)
def upload_dataset(
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """
    Handles multi-format uploads and returns the dataset with a 
    transparency 'processing_log'.
    """
    return process_uploaded_file(file, session)

@router.post("/preview")
def preview_dataset_endpoint(
    file: UploadFile = File(...)
):
    """
    Provides an immediate summary (Orientation) before the user 
    finalizes the upload.
    """
    from app.services.dataset_service import analyze_file_preview
    return analyze_file_preview(file)

@router.get("/", response_model=List[Dataset])
def read_datasets(session: Session = Depends(get_session)):
    datasets = session.exec(select(Dataset)).all()
    return datasets

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
    
    import os
    if os.path.exists(dataset.filepath):
        try:
            os.remove(dataset.filepath)
        except Exception:
            pass 

    session.delete(dataset)
    session.commit()
    return {"ok": True}

@router.get("/{dataset_id}/preview")
def preview_existing_dataset(dataset_id: int, session: Session = Depends(get_session)):
    """
    Retrieves preview data and dtypes for existing datasets in MySQL.
    Supports CSV, Excel, JSON, and XML.
    """
    dataset = session.get(Dataset, dataset_id)
    if not dataset or not dataset.filepath:
        raise HTTPException(status_code=404, detail="Dataset or file not found")
    
    import os
    if not os.path.exists(dataset.filepath):
         raise HTTPException(status_code=404, detail=f"File missing at {dataset.filepath}")

    try:
        import pandas as pd
        import numpy as np

        # Multi-format Reading Logic
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
        
        # Sanitize for JSON (Handling NaN/Infinity)
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        df = df.where(pd.notnull(df), None)
        
        return {
            "columns": list(df.columns),
            "data": df.to_dict(orient="records"),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "processing_log": dataset.processing_log # Include the log for the console
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")