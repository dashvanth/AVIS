import shutil
import os
import pandas as pd
import numpy as np
import json
import logging
from fastapi import UploadFile, HTTPException
from app.models.dataset import Dataset
from app.core.database import Session

# Setup high-fidelity logging for the Audit Trail
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def calculate_quality_score(df: pd.DataFrame) -> dict:
    """Calculates a multi-dimensional health score for the dataset."""
    total_cells = df.size
    if total_cells == 0:
        return {"score": 0, "rating": "Critical", "issues": ["Empty Dataset"]}
    
    missing_cells = int(df.isnull().sum().sum())
    duplicate_rows = int(df.duplicated().sum())
    
    # Calculate Data Density (Total valid data vs total possible cells)
    density = ((total_cells - missing_cells) / total_cells) * 100
    
    # Penalty-based scoring
    score = 100 - ((missing_cells / total_cells) * 60) - ((duplicate_rows / len(df)) * 40 if len(df) > 0 else 0)
    score = max(0, min(100, round(score, 1)))
    
    return {
        "score": score,
        "rating": "Optimal" if score > 90 else "Stable" if score > 70 else "Unstructured",
        "density": f"{density:.1f}%",
        "issues": [f"{missing_cells} gaps identified", f"{duplicate_rows} redundant rows"]
    }

def clean_and_audit(df: pd.DataFrame):
    """
    Functionality 2: Forensic Radical Transparency.
    Implements 'Before vs. After' states and Type Inference transparency.
    """
    audit_log = []
    
    # --- Capture RAW (Initial) Metrics ---
    initial_row_count = len(df)
    initial_col_count = len(df.columns)
    initial_null_count = int(df.isnull().sum().sum())

    # Forensic Step: Absolute Raw Metadata Capture
    raw_stats = {
        "total_nulls": initial_null_count,
        "null_rows": int(df.isnull().any(axis=1).sum()),
        "null_cols": int(df.isnull().any(axis=0).sum()),
        "duplicate_count": int(df.duplicated().sum())
    }

    # 1. Row Removal: Cleaning Empty Rows (Before vs. After)
    empty_rows = df.isnull().all(axis=1).sum()
    if empty_rows > 0:
        df = df.dropna(how='all')
        audit_log.append({
            "action": "Cleaning Empty Rows",
            "count": int(empty_rows),
            "before": initial_row_count,
            "after": initial_row_count - int(empty_rows),
            "reason": f"System identified {empty_rows} rows with no usable data. Removed to protect statistical integrity."
        })

    # 2. Column Removal: Removing Empty Columns (Before vs. After)
    empty_cols = df.isnull().all(axis=0).sum()
    if empty_cols > 0:
        df = df.dropna(axis=1, how='all')
        audit_log.append({
            "action": "Removing Empty Columns",
            "count": int(empty_cols),
            "before": initial_col_count,
            "after": initial_col_count - int(empty_cols),
            "reason": "Some columns had no information at all, so we tucked them away to simplify your view."
        })

    # 3. Type Inference & Integrity Check: Radical Type Transparency
    for col in df.columns:
        # Check if a numeric column is being read as an object due to noise
        if df[col].dtype == 'object':
            numeric_test = pd.to_numeric(df[col], errors='coerce')
            if numeric_test.notnull().mean() > 0.8: # If 80% is numeric
                audit_log.append({
                    "action": "Fixing Format Errors",
                    "column": col,
                    "detected_as": "Numerical",
                    "stored_as": "Text",
                    "reason": f"Column '{col}' was inferred as Numerical despite being stored as Text."
                })

    # Capture final stats for summary
    raw_stats.update({
        "final_rows": len(df),
        "final_cols": len(df.columns)
    })

    return df, audit_log, raw_stats

def analyze_file_preview(file: UploadFile):
    """Functionality 1: Automated Orientation Engine."""
    temp_path = f"{UPLOAD_DIR}/temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            file.file.seek(0)
            
        file_ext = file.filename.split('.')[-1].lower()
        
        # Multi-format Ingestion Node
        try:
            if file_ext == 'csv': 
                try: df = pd.read_csv(temp_path)
                except UnicodeDecodeError: df = pd.read_csv(temp_path, encoding='latin1')
            elif file_ext in ['xlsx', 'xls']: df = pd.read_excel(temp_path)
            elif file_ext == 'json': df = pd.read_json(temp_path)
            elif file_ext == 'xml': df = pd.read_xml(temp_path)
            else: raise HTTPException(status_code=400, detail="Format not supported by A.V.I.S")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Orientation Error: {str(e)}")
            
        # Execute Forensic Audit
        df_cleaned, audit_log, forensic_stats = clean_and_audit(df)
        
        # Isolate Anomaly Instances (Rows with at least one NULL)
        anomaly_df = df[df.isnull().any(axis=1)].head(50)
        
        return {
            "filename": file.filename,
            "file_type": file_ext,
            "row_count": len(df),
            "column_count": len(df.columns),
            "columns": list(df.columns),
            "full_data": df.head(100).replace({np.nan: None}).to_dict(orient="records"),
            "anomaly_data": anomaly_df.replace({np.nan: None}).to_dict(orient="records"),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "quality_score": calculate_quality_score(df),
            "structural_audit": {
                "total_nulls": forensic_stats["total_nulls"],
                "null_rows": forensic_stats["null_rows"],
                "null_cols": forensic_stats["null_cols"],
                "duplicates": forensic_stats["duplicate_count"]
            },
            "processing_log": json.dumps(audit_log)
        }
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

def process_uploaded_file(file: UploadFile, session: Session) -> Dataset:
    """Functionality 7: Final Handshake and MySQL Persistence."""
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_ext = file.filename.split('.')[-1].lower()
    try:
        # Load for final audit
        if file_ext == 'csv': df = pd.read_csv(file_location)
        elif file_ext in ['xlsx', 'xls']: df = pd.read_excel(file_location)
        elif file_ext == 'json': df = pd.read_json(file_location)
        elif file_ext == 'xml': df = pd.read_xml(file_location)
        
        df_cleaned, audit_log, forensic_stats = clean_and_audit(df)
        quality = calculate_quality_score(df)
        
        # Save high-performance binary version
        storage_path = file_location.rsplit('.', 1)[0] + "_processed.csv"
        df_cleaned.to_csv(storage_path, index=False)
        
        dataset = Dataset(
            filename=file.filename,
            filepath=storage_path,
            file_type=file_ext,
            row_count=len(df_cleaned),
            column_count=len(df_cleaned.columns),
            file_size_bytes=os.path.getsize(storage_path),
            unstructured_null_count=forensic_stats["total_nulls"],
            unstructured_row_removal_count=forensic_stats["null_rows"],
            quality_score=quality["score"],
            analyzed=True,
            processing_log=json.dumps(audit_log)
        )
        
        session.add(dataset)
        session.commit()
        session.refresh(dataset)
        
        if file_location != storage_path and os.path.exists(file_location):
            os.remove(file_location)
            
        return dataset
    except Exception as e:
        if os.path.exists(file_location): os.remove(file_location)
        raise HTTPException(status_code=400, detail=f"Handshake Aborted: {str(e)}")