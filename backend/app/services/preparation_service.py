
import pandas as pd
import numpy as np
import os
import json
from fastapi import HTTPException
from sqlmodel import Session
from app.models.dataset import Dataset
from app.services.eda_service import get_dataframe

def get_preparation_suggestions(dataset_id: int, session: Session):
    """
    Scans the dataset for common issues and provides suggestions.
    Read-Only operation.
    """
    df = get_dataframe(dataset_id, session)
    
    # 1. Missing Values
    missing_values = []
    fill_suggestions = {}
    
    for col in df.columns:
        missing_count = int(df[col].isnull().sum())
        if missing_count > 0:
            missing_values.append({
                "column": col, 
                "count": missing_count
            })
            
            # Smart suggestions based on type
            if pd.api.types.is_numeric_dtype(df[col]):
                fill_suggestions[col] = ["Fill with Mean (Average)", "Fill with Median (Center)", "Remove Rows", "Keep Empty"]
            else:
                fill_suggestions[col] = ["Fill with 'Unknown'", "Remove Rows", "Keep Empty"]

    # 2. Wrong Data Types (Heuristic)
    wrong_types = []
    type_suggestions = {}
    
    for col in df.columns:
        if df[col].dtype == 'object':
            # Check if it looks numeric
            numeric_test = pd.to_numeric(df[col], errors='coerce')
            if numeric_test.notnull().mean() > 0.8: # >80% parseable as numbers
                wrong_types.append({
                    "column": col,
                    "detected": "Text (Object)",
                    "expected": "Number"
                })
                type_suggestions[col] = ["Convert to Number", "Keep as Text"]

    # 3. Duplicates
    duplicate_count = int(df.duplicated().sum())

    return {
        "missing_values": missing_values,
        "wrong_types": wrong_types,
        "duplicates": {"count": duplicate_count},
        "suggestions": {
            "fill_missing": fill_suggestions,
            "convert_types": type_suggestions,
            "remove_duplicates": ["Remove Duplicates", "Keep Duplicates"] if duplicate_count > 0 else []
        }
    }

def apply_preparation_strategies(dataset_id: int, config: dict, session: Session):
    """
    Applies the selected cleaning strategies and creates a NEW dataset version.
    Original file is NEVER modified.
    """
    original_dataset = session.get(Dataset, dataset_id)
    if not original_dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    df = get_dataframe(dataset_id, session)
    change_log = []
    
    # 1. Apply Type Conversions (Run FIRST to enable numeric filling)
    type_config = config.get("convert_types", {})
    for col, strategy in type_config.items():
        if col not in df.columns: continue
        
        if strategy == "Convert to Number":
            # Coerce errors to NaN, then maybe fill? For now just coerce.
            df[col] = pd.to_numeric(df[col], errors='coerce')
            change_log.append(f"Converted '{col}' to Number")

    # 2. Apply Missing Value Fixes
    fill_config = config.get("fill_missing", {})
    for col, strategy in fill_config.items():
        if col not in df.columns: continue
        
        # Recalculate missing count after potential type conversion (some vals might have become NaN)
        initial_missing = df[col].isnull().sum()
        if initial_missing == 0: continue

        if strategy == "Fill with Mean (Average)" and pd.api.types.is_numeric_dtype(df[col]):
            mean_val = df[col].mean()
            df[col] = df[col].fillna(mean_val)
            change_log.append(f"Filled {initial_missing} missing in '{col}' with Mean ({mean_val:.2f})")
            
        elif strategy == "Fill with Median (Center)" and pd.api.types.is_numeric_dtype(df[col]):
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            change_log.append(f"Filled {initial_missing} missing in '{col}' with Median ({median_val})")
            
        elif strategy == "Fill with 'Unknown'":
            df[col] = df[col].fillna("Unknown")
            change_log.append(f"Filled {initial_missing} missing in '{col}' with 'Unknown'")
            
        elif strategy == "Remove Rows":
            # We determine indices to drop
            df = df.dropna(subset=[col])
            change_log.append(f"Removed rows with missing '{col}'")

    # 3. Remove Duplicates
    if config.get("remove_duplicates", False):
        initial_rows = len(df)
        df = df.drop_duplicates()
        removed = initial_rows - len(df)
        if removed > 0:
            change_log.append(f"Removed {removed} duplicate rows")

    # 4. Save NEW Dataset
    # Naming convention: filename_prepared.csv or filename_v2.csv
    base_name, ext = os.path.splitext(original_dataset.filename)
    new_filename = f"{base_name}_prepared{ext}"
    
    # Determine storage path
    original_dir = os.path.dirname(original_dataset.filepath)
    new_filepath = os.path.join(original_dir, f"{os.path.basename(base_name)}_prepared_v{pd.Timestamp.now().strftime('%H%M%S')}.csv")
    
    df.to_csv(new_filepath, index=False)
    
    # Create DB Entry
    new_dataset = Dataset(
        filename=new_filename,
        filepath=new_filepath,
        file_type="csv", # We standardize to CSV for prepared data
        row_count=len(df),
        column_count=len(df.columns),
        file_size_bytes=os.path.getsize(new_filepath),
        quality_score=original_dataset.quality_score, # Should ideally recalc, but okay for now
        analyzed=False, # Needs re-analysis? Or we assume cleaned is ready? Let's say False to trigger new preview gen if needed
        processing_log=json.dumps(change_log),
        ingestion_insights=original_dataset.ingestion_insights # Carry over context
    )
    
    session.add(new_dataset)
    session.commit()
    session.refresh(new_dataset)
    
    return {
        "new_dataset_id": new_dataset.id,
        "changes": change_log,
        "rows_remaining": len(df)
    }
