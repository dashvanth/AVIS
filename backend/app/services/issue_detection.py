import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.dataset import Dataset
from app.services.eda_service import get_dataframe

def calculate_health_score(missing_ratio: float, duplicate_ratio: float, outlier_ratio: float, type_error_ratio: float) -> int:
    score = 100.0
    score -= missing_ratio * 40
    score -= duplicate_ratio * 20
    score -= outlier_ratio * 20
    score -= type_error_ratio * 20
    return max(0, min(100, int(round(score))))

def detect_issues(dataset_id: int, session: Session):
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    df = get_dataframe(dataset_id, session)
    issues = []
    
    total_rows = len(df)
    if total_rows == 0:
        return {"issues": issues, "health_score": 0}
        
    # Stats matching the dataset format
    total_cells = total_rows * len(df.columns)
    total_missing = 0
    total_outliers = 0
    wrong_type_cols = 0
    
    # 1. Missing Values
    for col in df.columns:
        m_count = int(df[col].isnull().sum())
        if m_count > 0:
            issues.append({
                "column": col,
                "issue": "Missing Values",
                "count": m_count,
                "ratio": m_count / total_rows,
                "severity": "High" if (m_count / total_rows) > 0.1 else "Medium"
            })
            total_missing += m_count

    # 2. Duplicate Rows
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
         issues.append({
             "column": "Entire Dataset",
             "issue": "Duplicate Rows",
             "count": dup_count,
             "ratio": dup_count / total_rows,
             "severity": "Low"
         })
         
    duplicate_ratio = dup_count / total_rows if total_rows > 0 else 0
         
    # 3. Outliers & 4. Skewed distributions & 5. Data Types
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            # Outliers (IQR Method)
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outlier_mask = (df[col] < Q1 - 1.5 * IQR) | (df[col] > Q3 + 1.5 * IQR)
            outlier_count = int(outlier_mask.sum())
            if outlier_count > 0:
                issues.append({
                    "column": col,
                    "issue": "Outliers",
                    "count": outlier_count,
                    "ratio": outlier_count / total_rows,
                    "severity": "Medium"
                })
                total_outliers += outlier_count
                
            # Distribution skew
            skew_val = df[col].skew()
            if abs(skew_val) > 1:
                issues.append({
                    "column": col,
                    "issue": "Skewed Distribution",
                    "count": total_rows,
                    "ratio": 1.0,
                    "severity": "Low",
                    "details": f"Skewness: {skew_val:.2f}"
                })
        else:
            # Incorrect data types (e.g. numeric stored as object)
            numeric_test = pd.to_numeric(df[col], errors='coerce')
            if numeric_test.notnull().mean() > 0.8: # >80% parseable as numbers
                issues.append({
                    "column": col,
                    "issue": "Incorrect Data Type",
                    "count": int(numeric_test.isnull().sum()), 
                    "ratio": 1.0,
                    "severity": "High",
                    "details": "Numeric data stored as text"
                })
                wrong_type_cols += 1
                 
    # Calculate Ratios
    missing_ratio = total_missing / total_cells if total_cells > 0 else 0
    outlier_ratio = total_outliers / total_cells if total_cells > 0 else 0
    type_error_ratio = wrong_type_cols / len(df.columns) if len(df.columns) > 0 else 0
    
    score = calculate_health_score(missing_ratio, duplicate_ratio, outlier_ratio, type_error_ratio)
    
    return {
        "dataset_id": dataset_id,
        "health_score": score,
        "issues": issues
    }
