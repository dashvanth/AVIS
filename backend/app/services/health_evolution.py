import pandas as pd
from sqlalchemy.orm import Session
from app.services.eda_service import get_dataframe
from app.services.repair_engine import compute_column_stats, apply_strategy
from app.services.issue_detection import calculate_health_score
import numpy as np

def track_health_evolution(dataset_id: int, repair_steps: list[dict], session: Session) -> dict:
    """
    Computes a timeline of health score improvements based on consecutive simulated repairs.
    repair_steps expects a list of dicts: [{"column": "Age", "strategy": "Median Imputation"}, ...]
    """
    df_copy = get_dataframe(dataset_id, session).copy()
    
    # Compute initial health score
    total_cells = df_copy.shape[0] * df_copy.shape[1]
    missing_ratio = float(df_copy.isnull().sum().sum()) / total_cells if total_cells > 0 else 0
    duplicate_ratio = float(df_copy.duplicated().sum()) / len(df_copy) if len(df_copy) > 0 else 0
    initial_health = calculate_health_score(missing_ratio, duplicate_ratio, 0, 0)
    
    timeline = [{
        "step": "Initial Dataset",
        "health_score": initial_health
    }]
    
    for step in repair_steps:
        column = step.get("column")
        strategy = step.get("strategy")
        if not column or not strategy:
            continue
        if column != "Entire Dataset" and column not in df_copy.columns:
            continue
            
        # Apply repair using shared function
        df_copy, applied = apply_strategy(df_copy, column, strategy)
        
        if not applied:
            continue

        # Recalculate health score
        total_cells = df_copy.shape[0] * df_copy.shape[1]
        missing_ratio = float(df_copy.isnull().sum().sum()) / total_cells if total_cells > 0 else 0
        duplicate_ratio = float(df_copy.duplicated().sum()) / len(df_copy) if len(df_copy) > 0 else 0
        current_health = calculate_health_score(missing_ratio, duplicate_ratio, 0, 0)
        
        timeline.append({
            "step": f"{strategy} ({column})",
            "health_score": current_health
        })
        
    return {"timeline": timeline}
