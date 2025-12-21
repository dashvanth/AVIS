import pandas as pd
import numpy as np
from fastapi import HTTPException
from sqlmodel import Session
from app.models.dataset import Dataset

def get_dataframe(dataset_id: int, session: Session) -> pd.DataFrame:
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        # A.V.I.S standardizes cleaned files as CSV in dataset_service.py
        # We always attempt to read the filepath provided in MySQL
        df = pd.read_csv(dataset.filepath)
        return df
    except Exception as e:
        # Fallback for original formats if CSV conversion wasn't finalized
        try:
            if dataset.file_type == 'csv': df = pd.read_csv(dataset.filepath)
            elif dataset.file_type in ['xlsx', 'xls']: df = pd.read_excel(dataset.filepath)
            elif dataset.file_type == 'json': df = pd.read_json(dataset.filepath)
            else: raise HTTPException(status_code=400, detail="Unsupported file format")
            return df
        except Exception as inner_e:
            raise HTTPException(status_code=500, detail=f"Error loading dataset: {str(inner_e)}")

def get_summary_statistics(dataset_id: int, session: Session):
    df = get_dataframe(dataset_id, session)
    
    # Numeric Summary: Functionality 3
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        numeric_dict = []
    else:
        numeric_summary = numeric_df.describe().T.reset_index()
        numeric_summary.columns = ['column', 'count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']
        # Fix 500 error: Replace NaN with None for JSON compliance
        numeric_dict = numeric_summary.replace({np.nan: None}).to_dict(orient='records')
    
    # Categorical Summary: Functionality 3
    categorical_df = df.select_dtypes(exclude=[np.number])
    categorical_summary = []
    for col in categorical_df.columns:
        counts = categorical_df[col].value_counts().head(5).to_dict()
        categorical_summary.append({
            "column": col,
            "unique_count": int(categorical_df[col].nunique()),
            "top_values": counts
        })
        
    return {
        "numeric": numeric_dict,
        "categorical": categorical_summary,
        "total_rows": len(df),
        "total_columns": len(df.columns)
    }

def get_correlation_matrix(dataset_id: int, session: Session):
    df = get_dataframe(dataset_id, session)
    numeric_df = df.select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        return []
        
    # Fix 500 error: Handle correlation NaNs for JSON
    corr_matrix = numeric_df.corr().replace({np.nan: None}).reset_index()
    corr_matrix.rename(columns={'index': 'column'}, inplace=True)
    
    return corr_matrix.to_dict(orient='records')