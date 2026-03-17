import pandas as pd
import numpy as np
import os
from fastapi import HTTPException
from sqlmodel import Session
from app.models.dataset import Dataset

from functools import lru_cache

@lru_cache(maxsize=15)
def _load_dataframe_from_disk(filepath: str) -> pd.DataFrame:
    """Internal cached loader to prevent redundant disk I/O on large files."""
    try:
        return pd.read_csv(filepath)
    except Exception:
        return pd.read_csv(filepath, encoding='latin1')

def get_dataframe(dataset_id: int, session: Session) -> pd.DataFrame:
    """
    Functionality 1: Secure Ingestion Node.
    Validates physical file existence and handles encoding fallbacks.
    """
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset record missing in database.")
    
    if not dataset.filepath or not os.path.exists(dataset.filepath):
        raise HTTPException(
            status_code=404, 
            detail="The cleaned data matrix is missing from storage. Please re-upload."
        )
    
    try:
        df = _load_dataframe_from_disk(dataset.filepath)
        return df.copy() # Protect cached instance from mutation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Handshake Failure: Matrix corrupted ({str(e)})")

def get_summary_statistics(dataset_id: int, session: Session):
    """
    Functionality 3.3: Visible Backend Steps & Automated Statistics.
    Provides detailed reasoning for every calculation performed.
    """
    df = get_dataframe(dataset_id, session)
    
    # 1. Quantitative Logic: Central Tendency Audit
    numeric_df = df.select_dtypes(include=[np.number])
    numeric_dict = []
    
    if not numeric_df.empty:
        # Compute stats on actual data (skip NaNs, do NOT fill with 0)
        desc = numeric_df.describe().T.reset_index()
        desc.columns = ['column', 'count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']
        
        for _, row in desc.iterrows():
            col_name = row['column']
            col_data = numeric_df[col_name].dropna()
            skew = float(col_data.skew()) if len(col_data) > 2 else 0.0
            
            # --- Simple, clear reasoning ---
            logic_steps = [
                f"Calculated the average (mean) of {int(row['count'])} values in this column.",
                f"Measured how spread out the values are (standard deviation = {row['std']:.2f}).",
                f"Checked if values lean to one side (skewness = {skew:.2f})."
            ]
            
            insight = "Values are evenly spread — no unusual patterns."
            if abs(skew) > 1:
                insight = f"Values are clustered toward the {'lower' if skew > 0 else 'higher'} end of the range."
            elif row['std'] > row['mean'] and row['mean'] > 0:
                insight = "Values vary widely — there's a big difference between the smallest and largest entries."
            elif row['std'] < (row['mean'] * 0.05) and row['std'] != 0:
                insight = "Values are very consistent — most entries are nearly the same."
            
            numeric_dict.append({
                **row.replace({np.nan: None}).to_dict(),
                "skew": round(skew, 2),
                "insight": insight,
                "logic_desc": " | ".join(logic_steps)
            })

    # 2. Text / Category Columns
    categorical_df = df.select_dtypes(exclude=[np.number])
    categorical_summary = []
    
    for col in categorical_df.columns:
        counts = categorical_df[col].value_counts().head(5).to_dict()
        unique_count = int(categorical_df[col].nunique())
        
        diversity = "Balanced"
        insight = "Values are spread across multiple categories."
        
        if unique_count > (len(df) * 0.8):
            diversity = "Unique ID"
            insight = "Almost every row has a different value — this column is likely an ID or name."
        elif unique_count == 1:
            diversity = "Single Value"
            insight = "Every row has the same value — this column has no variety."
        elif unique_count < 5:
            diversity = "Few Categories"
            insight = "Only a few distinct values — good for grouping and comparison."
            
        categorical_summary.append({
            "column": col,
            "unique_count": unique_count,
            "top_values": counts,
            "diversity_index": diversity,
            "insight": insight
        })
        
    return {
        "numeric": numeric_dict,
        "categorical": categorical_summary,
        "total_rows": len(df),
        "total_columns": len(df.columns)
    }

def get_missing_values(dataset_id: int, session: Session):
    """
    Functionality 3.1: Gaps Audit Transparency.
    Optimized: Reads from JSON metadata instead of memory loading pandas.
    """
    import json
    import re
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        return []
        
    total_rows = dataset.row_count
    missing_data = []
    
    if dataset.ingestion_insights:
        try:
            insights = json.loads(dataset.ingestion_insights)
            for issue in insights.get("data_issues", []):
                if issue.get("issue_type") == "Missing Value":
                    col = issue.get("column_name")
                    match = re.search(r'has (\d+) empty', issue.get("explanation", ""))
                    m_count = int(match.group(1)) if match else 1
                    
                    pct = (m_count / total_rows) * 100 if total_rows else 0
                    impact = "Low" if pct < 2 else "Moderate" if pct < 10 else "Critical"
                    
                    missing_data.append({
                        "column": col,
                        "missing_count": m_count,
                        "missing_percentage": round(pct, 2),
                        "impact_level": f"{impact} Impact Gap",
                        "logic_desc": f"The system quickly recalled {m_count} empty cells from the audit log."
                    })
        except Exception:
            pass
            
    return sorted(missing_data, key=lambda x: x['missing_count'], reverse=True)

def get_correlation_matrix(dataset_id: int, session: Session):
    """
    Functionality 3.2: Relationship Discovery Logic.
    Explains the 'Pearson' math as a simple 'Connection Test'.
    """
    df = get_dataframe(dataset_id, session)
    # Remove columns that don't change (std=0) to prevent math errors
    numeric_df = df.select_dtypes(include=[np.number]).loc[:, df.nunique() > 1]
    
    if numeric_df.empty or len(numeric_df.columns) < 2:
        return {
            "matrix": [], 
            "top_discoveries": ["The engine needs at least two varying number columns to find links."],
            "logic_desc": "Scanned for connections, but the data was too simple to find meaningful links."
        }
        
    # Handle NaN and ensure JSON serializable output
    corr_matrix = numeric_df.corr().replace({np.nan: 0})
    
    discovery_insights = []
    stack = corr_matrix.stack()
    # Filter for strong links (>0.6) and exclude self-correlation (1.0)
    strong_links = stack[(abs(stack) > 0.6) & (stack < 1.0)].sort_values(ascending=False)
    
    seen_pairs = set()
    for (col1, col2), val in strong_links.items():
        pair = tuple(sorted((col1, col2)))
        if pair not in seen_pairs:
            relation_type = "Symmetry (+)" if val > 0 else "Conflict (-)"
            direction = "rise together" if val > 0 else "move in opposite directions"
            discovery_insights.append(
                f"{relation_type}: '{col1}' and '{col2}' {direction} (Strength: {abs(val):.2f})."
            )
            seen_pairs.add(pair)

    if not discovery_insights:
        discovery_insights.append("No strong mathematical connections were detected between your columns.")

    result = corr_matrix.reset_index()
    result.rename(columns={'index': 'column'}, inplace=True)
    
    return {
        "matrix": result.to_dict(orient='records'),
        "top_discoveries": list(discovery_insights)[:3],
        "logic_desc": "A.V.I.S performed a 'Relationship Discovery' scan using the Pearson Correlation method to find hidden patterns."
    }