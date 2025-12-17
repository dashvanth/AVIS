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
    return process_uploaded_file(file, session)

@router.post("/preview")
def preview_dataset_endpoint(
    file: UploadFile = File(...)
):
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
    
    # 1. Delete file from disk
    import os
    if os.path.exists(dataset.filepath):
        try:
            os.remove(dataset.filepath)
        except Exception:
            pass # Continue to delete from DB even if file deletion fails

    # 2. Delete from DB
    session.delete(dataset)
    session.commit()
    return {"ok": True}

@router.get("/{dataset_id}/preview")
def preview_dataset(dataset_id: int, session: Session = Depends(get_session)):
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    import os
    if not os.path.exists(dataset.filepath):
         raise HTTPException(status_code=404, detail=f"File not found on server at {dataset.filepath}")

    try:
        import pandas as pd
        import numpy as np

        if dataset.file_type == 'csv':
            try:
                df = pd.read_csv(dataset.filepath, nrows=100)
            except UnicodeDecodeError:
                # Fallback for non-UTF-8 files
                df = pd.read_csv(dataset.filepath, nrows=100, encoding='latin-1')
        elif dataset.file_type in ['xlsx', 'xls']:
            df = pd.read_excel(dataset.filepath, nrows=100)
        elif dataset.file_type == 'json':
            df = pd.read_json(dataset.filepath)
            df = df.head(100)
        elif dataset.file_type == 'xml':
            df = pd.read_xml(dataset.filepath)
            df = df.head(100)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {dataset.file_type}")
        
        # Data Sanitization for JSON Response
        # 1. Replace Infinity with None
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        # 2. Replace NaN with None (standard JSON null)
        df = df.where(pd.notnull(df), None)
        
        return {
            "columns": list(df.columns),
            "data": df.to_dict(orient="records"),
            "dtypes": df.dtypes.astype(str).to_dict()
        }
    except Exception as e:
        print(f"Preview Error for {dataset.filename}: {str(e)}") # Log to console
        raise HTTPException(status_code=500, detail=f"Error loading preview: {str(e)}")
