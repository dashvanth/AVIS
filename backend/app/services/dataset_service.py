import shutil
import os
import pandas as pd
import numpy as np
from fastapi import UploadFile, HTTPException
from app.models.dataset import Dataset
from app.core.database import Session

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def calculate_quality_score(df: pd.DataFrame) -> dict:
    total_cells = df.size
    total_rows = len(df)
    if total_cells == 0:
        return {"score": 0, "rating": "Bad", "issues": ["Empty Dataset"]}
    
    missing_cells = df.isnull().sum().sum()
    duplicate_rows = df.duplicated().sum()
    empty_cols = df.isnull().all().sum()
    
    # Penalties
    missing_penalty = (missing_cells / total_cells) * 100
    duplicate_penalty = (duplicate_rows / total_rows) * 100 if total_rows > 0 else 0
    empty_col_penalty = (empty_cols / len(df.columns)) * 100 if len(df.columns) > 0 else 0
    
    score = 100 - (missing_penalty + duplicate_penalty + empty_col_penalty)
    score = max(0, min(100, score)) # Clamp 0-100
    
    rating = "Good"
    if score < 80: rating = "Fair"
    if score < 50: rating = "Poor"
    
    issues = []
    if missing_cells > 0: issues.append(f"{missing_cells} missing values")
    if duplicate_rows > 0: issues.append(f"{duplicate_rows} duplicate rows")
    if empty_cols > 0: issues.append(f"{empty_cols} empty columns")
    
    return {"score": round(score, 1), "rating": rating, "issues": issues}

def analyze_file_preview(file: UploadFile):
    # Read file into memory (or temp) for preview
    # For large files, we might want to read chunks, but for now assuming reasonable size for "preview" in this prototype
    # or better: save to temp, read, delete.
    temp_path = f"{UPLOAD_DIR}/temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            file.file.seek(0) # Reset cursor for subsequent reads/uploads if needed
            
        file_extension = file.filename.split('.')[-1].lower()
        
        if file_extension == 'csv':
            df = pd.read_csv(temp_path)
        elif file_extension in ['xlsx', 'xls']:
            df = pd.read_excel(temp_path)
        elif file_extension == 'json':
            df = pd.read_json(temp_path)
        elif file_extension == 'xml':
            df = pd.read_xml(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
        # Basic Stats
        row_count, column_count = df.shape
        quality = calculate_quality_score(df)
        
        # Preview Data (Head)
        preview_df = df.head(5).replace({np.nan: None}) # Handle NaNs for JSON serialization
        
        # Column Types
        dtypes = df.dtypes.astype(str).to_dict()
        
        return {
            "filename": file.filename,
            "row_count": row_count,
            "column_count": column_count,
            "columns": list(df.columns),
            "preview_data": preview_df.to_dict(orient="records"),
            "dtypes": dtypes,
            "quality_score": quality
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing file: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def process_uploaded_file(file: UploadFile, session: Session) -> Dataset:
    # 1. Save file to disk
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Determine file type and load with Pandas
    file_extension = file.filename.split('.')[-1].lower()
    try:
        if file_extension == 'csv':
            df = pd.read_csv(file_location)
        elif file_extension in ['xlsx', 'xls']:
            df = pd.read_excel(file_location)
        elif file_extension == 'json':
            df = pd.read_json(file_location)
        elif file_extension == 'xml':
            df = pd.read_xml(file_location)
        else:
            os.remove(file_location)
            raise HTTPException(status_code=400, detail="Unsupported file format")
    except Exception as e:
        os.remove(file_location)
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # 3. Extract Metadata
    row_count, column_count = df.shape
    file_size = os.path.getsize(file_location)

    # 4. Save to DB
    dataset = Dataset(
        filename=file.filename,
        filepath=file_location,
        file_type=file_extension,
        row_count=row_count,
        column_count=column_count,
        file_size_bytes=file_size,
        analyzed=False
    )
    
    session.add(dataset)
    session.commit()
    session.refresh(dataset)
    
    return dataset
