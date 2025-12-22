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
    
    # CRITICAL FIX: Verify physical disk presence to prevent 500 crashes
    if not dataset.filepath or not os.path.exists(dataset.filepath):
        raise HTTPException(
            status_code=404, 
            detail=f"Relational binary missing at {dataset.filepath}. Please re-upload the dataset."
        )
    
    try:
        # A.V.I.S standardizes cleaned files as CSV
        return pd.read_csv(dataset.filepath)
    except Exception:
        # Forensic Fallback for encoding anomalies (Latin-1/ISO)
        try:
            return pd.read_csv(dataset.filepath, encoding='latin1')
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Handshake Failure: Corrupted matrix ({str(e)})")

def get_summary_statistics(dataset_id: int, session: Session):
    """
    Functionality 3: Automated Statistics & Visible Backend Steps.
    Generates high-fidelity insights by analyzing distribution shape and variance.
    """
    df = get_dataframe(dataset_id, session)
    
    # 1. Quantitative Logic: Central Tendency & Shape Audit
    numeric_df = df.select_dtypes(include=[np.number])
    numeric_dict = []
    if not numeric_df.empty:
        desc = numeric_df.describe().T.reset_index()
        desc.columns = ['column', 'count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']
        
        for _, row in desc.iterrows():
            col_name = row['column']
            # System Logic: Calculate Skewness for deeper insight
            skew = df[col_name].skew()
            
            # Automated Discovery Insights for beginners
            insight = "Stable distribution detected."
            if abs(skew) > 1:
                insight = f"Heavily Skewed: Values are clustered toward the {'bottom' if skew > 0 else 'top'}."
            elif row['std'] > row['mean']:
                insight = "High Variance: Data points are widely spread from the average."
            elif row['std'] < (row['mean'] * 0.05):
                insight = "Highly Consistent: Almost all records share similar values."
            
            numeric_dict.append({
                **row.replace({np.nan: None}).to_dict(),
                "insight": insight 
            })

    # 2. Qualitative Logic: Categorical Diversity Index
    categorical_df = df.select_dtypes(exclude=[np.number])
    categorical_summary = []
    for col in categorical_df.columns:
        counts = categorical_df[col].value_counts().head(5).to_dict()
        unique_count = int(categorical_df[col].nunique())
        
        # System Logic: Diversity Assessment
        diversity = "Balanced Groups"
        if unique_count > (len(df) * 0.8):
            diversity = "Unique Identifiers: Every row is almost distinct."
        elif unique_count == 1:
            diversity = "Zero Variance: All rows contain the same label."
        elif unique_count < 5:
            diversity = "Highly Grouped: Data fits into a few distinct buckets."
            
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
    Functionality 3.1: Missing Value Indicators.
    Precisely maps gaps to show users where data is 'unstructured'.
    """
    df = get_dataframe(dataset_id, session)
    total_rows = len(df)
    
    missing_data = []
    for col in df.columns:
        m_count = int(df[col].isnull().sum())
        if m_count > 0:
            pct = (m_count / total_rows) * 100
            impact = "Low Impact" if pct < 2 else "Medium Impact" if pct < 10 else "High Anomaly"
            missing_data.append({
                "column": col,
                "missing_count": m_count,
                "missing_percentage": round(pct, 2),
                "impact_level": impact
            })
            
    return sorted(missing_data, key=lambda x: x['missing_count'], reverse=True)

def get_correlation_matrix(dataset_id: int, session: Session):
    """
    Functionality 3.2: Relationship Discovery.
    Identifies hidden links between variables using Pearson calculations.
    """
    df = get_dataframe(dataset_id, session)
    numeric_df = df.select_dtypes(include=[np.number])
    
    if numeric_df.empty or len(numeric_df.columns) < 2:
        return {"matrix": [], "top_discoveries": []}
        
    # Handle NaN and ensure JSON serializable output
    corr_matrix = numeric_df.corr().replace({np.nan: 0})
    
    # 3. Discovery Node: Identify logical connections
    discovery_insights = []
    stack = corr_matrix.stack()
    strong_links = stack[(abs(stack) > 0.65) & (stack < 1.0)].sort_values(ascending=False)
    
    seen_pairs = set()
    for (col1, col2), val in strong_links.items():
        pair = tuple(sorted((col1, col2)))
        if pair not in seen_pairs:
            direction = "increases" if val > 0 else "decreases"
            discovery_insights.append(
                f"Logical Link: As '{col1}' rises, '{col2}' usually {direction} (Strength: {abs(val):.2f})."
            )
            seen_pairs.add(pair)

    result = corr_matrix.reset_index()
    result.rename(columns={'index': 'column'}, inplace=True)
    
    # MUST return an object with 'matrix' and 'top_discoveries' to match frontend types
    return {
        "matrix": result.to_dict(orient='records'),
        "top_discoveries": list(discovery_insights)[:3]
    }