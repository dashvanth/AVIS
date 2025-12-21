# backend/app/api/endpoints/datasets.py
from typing import List, Dict, Any
import os
import json
import pandas as pd
import numpy as np
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.dataset import Dataset
from app.services.dataset_service import (
    process_uploaded_file, 
    analyze_file_preview, 
    calculate_quality_score
)

router = APIRouter()

@router.post("/upload", response_model=Dataset)
async def upload_dataset(
    file: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    """Functionality 7: Secure Ingestion and Audit Persistence."""
    try:
        dataset = process_uploaded_file(file, session)
        return dataset
    except Exception as e:
        print(f"CRITICAL UPLOAD ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/preview")
async def preview_dataset_endpoint(
    file: UploadFile = File(...)
):
    """
    Functionality 1: Automatic Orientation.
    Provides immediate feedback on file structure before saving to database.
    """
    try:
        return analyze_file_preview(file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Orientation Failed: {str(e)}")

@router.get("/", response_model=List[Dataset])
def read_datasets(session: Session = Depends(get_session)):
    """Retrieves high-fidelity audit history sorted by most recent ingest."""
    return session.exec(select(Dataset).order_by(Dataset.id.desc())).all()

@router.get("/{dataset_id}/preview")
def preview_existing_dataset(dataset_id: int, session: Session = Depends(get_session)):
    """
    Functionality 2: Forensic Radical Transparency.
    Isolates 'not good' rows and calculates simple metrics for the frontend cards.
    """
    dataset = session.get(Dataset, dataset_id)
    if not dataset or not dataset.filepath or not os.path.exists(dataset.filepath):
        raise HTTPException(status_code=404, detail="Relational asset binary missing.")

    try:
        # Load raw data with encoding fallback
        try:
            df = pd.read_csv(dataset.filepath)
        except UnicodeDecodeError:
            df = pd.read_csv(dataset.filepath, encoding='latin-1')
        
        # 1. SIMPLE FORENSIC METRICS: Terminology simplified for beginners
        null_mask = df.isnull().any(axis=1)
        null_row_count = int(null_mask.sum())
        null_col_count = int(df.isnull().any(axis=0).sum())
        total_missing = int(df.isnull().sum().sum())
        
        # 2. TYPE MISMATCH ENGINE: Detects 'Wrong Types' (Numbers stored as Text)
        type_mismatches = 0
        for col in df.columns:
            if df[col].dtype == 'object':
                # Check if this text column contains mostly numeric patterns
                clean_col = df[col].dropna()
                if not clean_col.empty:
                    numeric_conv = pd.to_numeric(clean_col, errors='coerce')
                    if (numeric_conv.notnull().sum() / len(clean_col)) > 0.5:
                        type_mismatches += 1
        
        # 3. ANOMALY ISOLATION: Isolates rows with nulls for the targeted preview
        anomaly_df = df[null_mask].head(50)
        
        # Sanitize for JSON Handshake (NaN -> None)
        df_full = df.head(100).replace({np.nan: None})
        df_anomaly = anomaly_df.replace({np.nan: None})
        
        return {
            "columns": list(df.columns),
            "full_data": df_full.to_dict(orient="records"),
            "anomaly_data": df_anomaly.to_dict(orient="records"),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "quality_score": calculate_quality_score(df),
            "processing_log": dataset.processing_log,
            
            # This object maps to the 4 simple cards in DatasetsPage
            "structural_audit": {
                "total_nulls": total_missing, # Shows exactly 249 for Car Sales
                "null_rows": null_row_count,
                "null_cols": null_col_count
            },
            
            # Simple metadata for the orientation sidebar
            "audit_metrics": {
                "wrong_types": type_mismatches,
                "total_entities": len(df),
                "asset_importance": "Unstructured Data Detected" if total_missing > 0 else "Structured Asset"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forensic Audit Failed: {str(e)}")

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: int, session: Session = Depends(get_session)):
    """Removes MySQL metadata and associated binary files from the buffer."""
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    if os.path.exists(dataset.filepath):
        try: os.remove(dataset.filepath)
        except Exception as e: print(f"Deletion Warning: {e}")

    session.delete(dataset)
    session.commit()
    return {"ok": True}