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
        if dataset.file_type == 'csv':
            df = pd.read_csv(dataset.filepath)
        elif dataset.file_type in ['xlsx', 'xls']:
            df = pd.read_excel(dataset.filepath)
        elif dataset.file_type == 'json':
            df = pd.read_json(dataset.filepath)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        return df
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dataset: {str(e)}")

def get_summary_statistics(dataset_id: int, session: Session):
    df = get_dataframe(dataset_id, session)
    
    # Numeric Summary
    numeric_df = df.select_dtypes(include=[np.number])
    numeric_summary = numeric_df.describe().T.reset_index()
    numeric_summary.columns = ['column', 'count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']
    
    # Categorical Summary
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
        "numeric": numeric_summary.to_dict(orient='records'),
        "categorical": categorical_summary,
        "total_rows": len(df),
        "total_columns": len(df.columns)
    }

def get_missing_values(dataset_id: int, session: Session):
    df = get_dataframe(dataset_id, session)
    missing = df.isnull().sum().reset_index()
    missing.columns = ['column', 'missing_count']
    missing['missing_percentage'] = (missing['missing_count'] / len(df)) * 100
    missing = missing[missing['missing_count'] > 0].sort_values(by='missing_count', ascending=False)
    
    return missing.to_dict(orient='records')

def get_correlation_matrix(dataset_id: int, session: Session):
    df = get_dataframe(dataset_id, session)
    numeric_df = df.select_dtypes(include=[np.number])
    
    if numeric_df.empty:
        return []
        
    corr_matrix = numeric_df.corr().reset_index()
    corr_matrix.rename(columns={'index': 'column'}, inplace=True)
    
    return corr_matrix.to_dict(orient='records')
