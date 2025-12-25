import pandas as pd
import numpy as np
import os
from fastapi import HTTPException
from sqlmodel import Session
from app.models.dataset import Dataset

def get_dataframe(dataset_id: int, session: Session) -> pd.DataFrame:
    """
    Functionality 1: Secure Ingestion Node.
    Validates physical file existence on disk before initiating analysis.
    """
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Relational asset not found in database.")
    
    if not dataset.filepath or not os.path.exists(dataset.filepath):
        raise HTTPException(
            status_code=404, 
            detail=f"Relational binary missing. Please re-upload the dataset."
        )
    
    try:
        # A.V.I.S standardizes cleaned files as CSV
        return pd.read_csv(dataset.filepath)
    except Exception as e:
        # Forensic Fallback for encoding anomalies
        try:
            return pd.read_csv(dataset.filepath, encoding='latin1')
        except Exception:
            raise HTTPException(status_code=500, detail="Matrix Handshake Failure: Data is unreadable.")

def get_summary_statistics(dataset_id: int, session: Session):
    """
    Functionality 3: Simplified Automated Statistics.
    Generates beginner-friendly insights about data averages and patterns.
    """
    df = get_dataframe(dataset_id, session)
    
    # 1. Quantitative Logic: Simple Averages & Spread
    numeric_df = df.select_dtypes(include=[np.number])
    numeric_dict = []
    
    if not numeric_df.empty:
        # Fill missing values with 0 for calculation to avoid 500 errors
        calc_df = numeric_df.fillna(0)
        desc = calc_df.describe().T.reset_index()
        desc.columns = ['column', 'count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']
        
        for _, row in desc.iterrows():
            col_name = row['column']
            # Simplified Insight Engine
            skew = calc_df[col_name].skew()
            
            insight = "Most values are balanced around the average."
            if abs(skew) > 1:
                insight = f"Values are mostly clustered toward the {'bottom' if skew > 0 else 'top'}."
            elif row['std'] > row['mean']:
                insight = "High Spread: The numbers in this column vary quite a lot."
            elif row['std'] < (row['mean'] * 0.05) and row['std'] != 0:
                insight = "Very Consistent: Almost all rows have very similar numbers."
            
            numeric_dict.append({
                **row.replace({np.nan: None}).to_dict(),
                "insight": insight 
            })

    # 2. Qualitative Logic: Grouping & Categories
    categorical_df = df.select_dtypes(exclude=[np.number])
    categorical_summary = []
    
    for col in categorical_df.columns:
        counts = categorical_df[col].value_counts().head(5).to_dict()
        unique_count = int(categorical_df[col].nunique())
        
        # Simplified Diversity Assessment
        diversity = "Balanced Groups"
        if unique_count > (len(df) * 0.8):
            diversity = "Mostly Unique: Almost every row has a different label."
        elif unique_count == 1:
            diversity = "Single Category: Every single row has the same label."
        elif unique_count < 5:
            diversity = "Clear Groups: Data fits into a few specific buckets."
            
        categorical_summary.append({
            "column": col,
            "unique_count": unique_count,
            "top_values": counts,
            "diversity_index": diversity
        })
        
    return {
        "numeric": numeric_dict,
        "categorical": categorical_summary,
        "total_rows": len(df),
        "total_columns": len(df.columns)
    }

def get_missing_values(dataset_id: int, session: Session):
    """
    Functionality 3.1: Simplified Gap Mapping.
    """
    df = get_dataframe(dataset_id, session)
    total_rows = len(df)
    
    missing_data = []
    for col in df.columns:
        m_count = int(df[col].isnull().sum())
        if m_count > 0:
            pct = (m_count / total_rows) * 100
            # Friendly impact labels
            impact = "Tiny Gap" if pct < 2 else "Noticeable Gap" if pct < 10 else "Large Missing Area"
            missing_data.append({
                "column": col,
                "missing_count": m_count,
                "missing_percentage": round(pct, 2),
                "impact_level": impact
            })
            
    return sorted(missing_data, key=lambda x: x['missing_count'], reverse=True)

def get_correlation_matrix(dataset_id: int, session: Session):
    """
    Functionality 3.2: Simplified Relationship Discovery.
    Detects how columns move together in plain English.
    """
    df = get_dataframe(dataset_id, session)
    # Filter out columns with zero variance to prevent math errors (500 errors)
    numeric_df = df.select_dtypes(include=[np.number]).loc[:, df.nunique() > 1]
    
    if numeric_df.empty or len(numeric_df.columns) < 2:
        return {"matrix": [], "top_discoveries": ["No strong connections found between columns yet."]}
        
    # Calculate links and handle empty results
    corr_matrix = numeric_df.corr().replace({np.nan: 0})
    
    discovery_insights = []
    stack = corr_matrix.stack()
    # Find strong relationships (Strength > 0.6)
    strong_links = stack[(abs(stack) > 0.6) & (stack < 1.0)].sort_values(ascending=False)
    
    seen_pairs = set()
    for (col1, col2), val in strong_links.items():
        pair = tuple(sorted((col1, col2)))
        if pair not in seen_pairs:
            direction = "move in the same direction" if val > 0 else "move in opposite directions"
            discovery_insights.append(
                f"Relationship Found: '{col1}' and '{col2}' {direction}."
            )
            seen_pairs.add(pair)

    if not discovery_insights:
        discovery_insights.append("We scanned the data but didn't find any columns that strongly affect each other.")

    result = corr_matrix.reset_index()
    result.rename(columns={'index': 'column'}, inplace=True)
    
    return {
        "matrix": result.to_dict(orient='records'),
        "top_discoveries": list(discovery_insights)[:3]
    }