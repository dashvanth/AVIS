import pandas as pd
import numpy as np
import os
from fastapi import HTTPException
from sqlmodel import Session
from app.models.dataset import Dataset

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
        return pd.read_csv(dataset.filepath)
    except Exception:
        try:
            return pd.read_csv(dataset.filepath, encoding='latin1')
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
        # Fill missing with 0 for internal calculations to prevent crash
        calc_df = numeric_df.fillna(0)
        desc = calc_df.describe().T.reset_index()
        desc.columns = ['column', 'count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']
        
        for _, row in desc.iterrows():
            col_name = row['column']
            skew = calc_df[col_name].skew()
            
            # --- Advanced Step Reasoning (Functionality 3) ---
            logic_steps = [
                "Summed all numerical entries and divided by total count to find the 'Mean'.",
                "Calculated standard deviation to measure how far data points 'stray' from the average.",
                f"Performed a skewness test ({skew:.2f}) to detect if data clusters at extreme ends."
            ]
            
            insight = "Your data is balanced around the center."
            if abs(skew) > 1:
                insight = f"Heavy Clumping: Most values sit at the {'bottom' if skew > 0 else 'top'} of the range."
            elif row['std'] > row['mean']:
                insight = "High Volatility: The values vary significantly from one row to the next."
            elif row['std'] < (row['mean'] * 0.05) and row['std'] != 0:
                insight = "High Consistency: Values are nearly identical across the entire column."
            
            numeric_dict.append({
                **row.replace({np.nan: None}).to_dict(),
                "skew": round(skew, 2),
                "insight": insight,
                "logic_desc": " | ".join(logic_steps) # Explicit backend steps
            })

    # 2. Qualitative Logic: Label Frequency Audit
    categorical_df = df.select_dtypes(exclude=[np.number])
    categorical_summary = []
    
    for col in categorical_df.columns:
        counts = categorical_df[col].value_counts().head(5).to_dict()
        unique_count = int(categorical_df[col].nunique())
        
        # Diversity Reasoning
        diversity = "Balanced Groups"
        reasoning = "The system grouped identical labels to see which category dominates your data."
        
        if unique_count > (len(df) * 0.8):
            diversity = "Unique ID Pattern"
            reasoning = "Almost every row has a different label. This column likely acts as an ID or name."
        elif unique_count == 1:
            diversity = "Static Label"
            reasoning = "This column provides no variety; every row contains the exact same information."
        elif unique_count < 5:
            diversity = "High Concentration"
            reasoning = "Data is funneled into a few very specific buckets, great for group analysis."
            
        categorical_summary.append({
            "column": col,
            "unique_count": unique_count,
            "top_values": counts,
            "diversity_index": diversity,
            "logic_desc": reasoning
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
    """
    df = get_dataframe(dataset_id, session)
    total_rows = len(df)
    
    missing_data = []
    for col in df.columns:
        m_count = int(df[col].isnull().sum())
        if m_count > 0:
            pct = (m_count / total_rows) * 100
            impact = "Low" if pct < 2 else "Moderate" if pct < 10 else "Critical"
            missing_data.append({
                "column": col,
                "missing_count": m_count,
                "missing_percentage": round(pct, 2),
                "impact_level": f"{impact} Impact Gap",
                "logic_desc": f"The system scanned {total_rows} rows and identified {m_count} empty cells."
            })
            
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