import shutil
import os
import pandas as pd
import numpy as np
import json
from fastapi import UploadFile, HTTPException
from app.models.dataset import Dataset
from app.core.database import Session

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def calculate_quality_score(df: pd.DataFrame) -> dict:
    """Calculates a beginner-friendly quality score."""
    total_cells = df.size
    if total_cells == 0:
        return {"score": 0, "rating": "Bad", "issues": ["Empty Dataset"]}
    
    missing_cells = df.isnull().sum().sum()
    duplicate_rows = df.duplicated().sum()
    
    score = 100 - ((missing_cells / total_cells) * 100) - ((duplicate_rows / len(df)) * 100 if len(df) > 0 else 0)
    score = max(0, min(100, score))
    
    return {
        "score": round(score, 1),
        "rating": "Good" if score > 80 else "Fair" if score > 50 else "Poor",
        "issues": [f"{missing_cells} missing values"] if missing_cells > 0 else []
    }

def clean_and_audit(df: pd.DataFrame):
    """
    Performs transparent cleaning and generates an audit log.
    Fulfills Guide Requirement #1: Show exactly what has been removed.
    """
    audit_log = []
    
    # 1. Row Removal
    empty_rows = df.isnull().all(axis=1).sum()
    if empty_rows > 0:
        df = df.dropna(how='all')
        audit_log.append({
            "action": "Empty Row Removal",
            "count": int(empty_rows),
            "reason": "Removed rows with zero data to ensure statistical accuracy."
        })

    # 2. Column Removal
    empty_cols = df.isnull().all(axis=0).sum()
    if empty_cols > 0:
        df = df.dropna(axis=1, how='all')
        audit_log.append({
            "action": "Empty Column Removal",
            "count": int(empty_cols),
            "reason": "Pruned columns containing no information."
        })

    # 3. Success Log
    audit_log.append({
        "action": "Structure Finalized",
        "count": len(df.columns),
        "reason": f"Verified {len(df.columns)} columns for exploratory analysis."
    })

    return df, audit_log

def analyze_file_preview(file: UploadFile):
    """Provides immediate Orientation summary before upload."""
    temp_path = f"{UPLOAD_DIR}/temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            file.file.seek(0)
            
        file_ext = file.filename.split('.')[-1].lower()
        if file_ext == 'csv': df = pd.read_csv(temp_path)
        elif file_ext in ['xlsx', 'xls']: df = pd.read_excel(temp_path)
        elif file_ext == 'json': df = pd.read_json(temp_path)
        elif file_ext == 'xml': df = pd.read_xml(temp_path)
        else: raise HTTPException(status_code=400, detail="Unsupported format")
            
        df_cleaned, audit_log = clean_and_audit(df)
        
        return {
            "filename": file.filename,
            "row_count": len(df_cleaned),
            "column_count": len(df_cleaned.columns),
            "columns": list(df_cleaned.columns),
            "preview_data": df_cleaned.head(5).replace({np.nan: None}).to_dict(orient="records"),
            "dtypes": df_cleaned.dtypes.astype(str).to_dict(),
            "quality_score": calculate_quality_score(df_cleaned),
            "processing_log": json.dumps(audit_log)
        }
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

def process_uploaded_file(file: UploadFile, session: Session) -> Dataset:
    """Saves multi-format files and stores the transparency log in MySQL."""
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_ext = file.filename.split('.')[-1].lower()
    try:
        if file_ext == 'csv': df = pd.read_csv(file_location)
        elif file_ext in ['xlsx', 'xls']: df = pd.read_excel(file_location)
        elif file_ext == 'json': df = pd.read_json(file_location)
        elif file_ext == 'xml': df = pd.read_xml(file_location)
        else: raise HTTPException(status_code=400, detail="Unsupported format")
            
        df_cleaned, audit_log = clean_and_audit(df)
        df_cleaned.to_csv(file_location, index=False)
        
        dataset = Dataset(
            filename=file.filename,
            filepath=file_location,
            file_type=file_ext,
            row_count=len(df_cleaned),
            column_count=len(df_cleaned.columns),
            file_size_bytes=os.path.getsize(file_location),
            analyzed=True,
            processing_log=json.dumps(audit_log)
        )
        
        session.add(dataset)
        session.commit()
        session.refresh(dataset)
        return dataset
    except Exception as e:
        if os.path.exists(file_location): os.remove(file_location)
        raise HTTPException(status_code=400, detail=str(e))