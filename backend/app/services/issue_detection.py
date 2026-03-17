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
        
    total_cells = total_rows * len(df.columns)
    total_missing = 0
    total_outliers = 0
    wrong_type_cols = 0
    
    # 1. Missing Values — with affected row indices and percentage
    for col in df.columns:
        m_count = int(df[col].isnull().sum())
        if m_count > 0:
            # Get first 20 row indices where this column is null
            affected_indices = df[df[col].isnull()].index.tolist()[:20]
            missing_pct = round((m_count / total_rows) * 100, 2)
            
            issues.append({
                "column": col,
                "issue": "Missing Values",
                "count": m_count,
                "ratio": m_count / total_rows,
                "missing_percentage": missing_pct,
                "affected_row_indices": affected_indices,
                "severity": "High" if (m_count / total_rows) > 0.1 else "Medium"
            })
            total_missing += m_count

    # 2. Duplicate Rows — with sample rows and indices
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        dup_mask = df.duplicated(keep=False)
        dup_indices = df[df.duplicated()].index.tolist()[:20]
        sample_rows = df[df.duplicated()].head(5).replace({np.nan: None}).to_dict(orient="records")
        
        issues.append({
            "column": "Entire Dataset",
            "issue": "Duplicate Rows",
            "count": dup_count,
            "ratio": dup_count / total_rows,
            "duplicate_row_indices": dup_indices,
            "sample_rows": sample_rows,
            "severity": "Low"
        })
         
    duplicate_ratio = dup_count / total_rows if total_rows > 0 else 0
         
    # 3. Outliers (IQR Method) & 4. Skewed distributions & 5. Data Type issues
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            # Outliers
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outlier_mask = (df[col] < Q1 - 1.5 * IQR) | (df[col] > Q3 + 1.5 * IQR)
            outlier_count = int(outlier_mask.sum())
            if outlier_count > 0:
                affected_indices = df[outlier_mask].index.tolist()[:20]
                issues.append({
                    "column": col,
                    "issue": "Outliers",
                    "count": outlier_count,
                    "ratio": outlier_count / total_rows,
                    "affected_row_indices": affected_indices,
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
            # Type issues: numeric stored as object
            numeric_test = pd.to_numeric(df[col], errors='coerce')
            if numeric_test.notnull().mean() > 0.8:
                non_numeric_mask = numeric_test.isnull() & df[col].notnull()
                affected_indices = df[non_numeric_mask].index.tolist()[:20]
                issues.append({
                    "column": col,
                    "issue": "Incorrect Data Type",
                    "count": int(non_numeric_mask.sum()),
                    "ratio": 1.0,
                    "expected_type": "numeric",
                    "actual_type": str(df[col].dtype),
                    "affected_row_indices": affected_indices,
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
