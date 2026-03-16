import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.services.eda_service import get_dataframe

def compute_quality_metrics(dataset_id: int, session: Session) -> dict:
    df = get_dataframe(dataset_id, session)
    
    if df.empty:
        return {
            "completeness": 0,
            "consistency": 0,
            "uniqueness": 0,
            "stability": 0,
            "type_integrity": 0
        }

    total_cells = df.size
    total_rows = len(df)
    total_cols = len(df.columns)

    # 1. Completeness = 1 - (missing_cells / total_cells)
    missing_cells = df.isnull().sum().sum()
    completeness = (1 - (missing_cells / total_cells)) * 100 if total_cells > 0 else 0

    # 2. Consistency = 1 - duplicate_ratio
    duplicate_rows = df.duplicated().sum()
    consistency = (1 - (duplicate_rows / total_rows)) * 100 if total_rows > 0 else 0

    # 3. Uniqueness = unique_rows / total_rows
    # Differentiating from consistency (which checks full duplicates).
    # We will measure structural uniqueness as the average ratio of unique values per column mapped to row count.
    col_uniqueness = [len(df[col].dropna().unique()) / total_rows for col in df.columns]
    # Bound between 0 and 100. High cardinality yields high uniqueness.
    uniqueness = (sum(col_uniqueness) / total_cols) * 100 if total_cols > 0 else 0
    # Boost uniqueness mathematically so dense categorical matrices aren't unfairly penalized.
    uniqueness = min(100, uniqueness * 2 + 20) 

    # 4. Distribution Stability = map skewness boundaries
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 0:
        stable_count = 0
        for col in numeric_cols:
            if df[col].dropna().empty:
                continue
            skewness = df[col].skew()
            # If skew is close to 0 (-1 to 1 is highly symmetrical, -2 to 2 is acceptable)
            if pd.notna(skewness) and abs(skewness) <= 2:
                stable_count += 1
        stability = (stable_count / len(numeric_cols)) * 100
    else:
        stability = 100  # Default to 100 if no numeric columns to destablize

    # 5. Type Integrity = Identify unparsed / mixed types
    object_cols = df.select_dtypes(include=['object']).shape[1]
    # Penalize purely string/object heavy frames mildly, standard mapping reduces absolute perfection
    type_integrity = max(0, 100 - ((object_cols / total_cols) * 40)) if total_cols > 0 else 0

    return {
        "completeness": round(completeness, 1),
        "consistency": round(consistency, 1),
        "uniqueness": round(uniqueness, 1),
        "stability": round(stability, 1),
        "type_integrity": round(type_integrity, 1)
    }
