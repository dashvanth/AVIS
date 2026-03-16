import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services.eda_service import get_dataframe
from app.services.issue_detection import detect_issues
from app.services.repair_engine import simulate_repair

def compare_repair_strategies(dataset_id: int, column: str, session: Session) -> dict:
    """
    Evaluates up to 5 different strategies, calculates the absolute differential distortion,
    and sorts the output by Highest Health Score followed by Lowest Mathematical Distortion.
    """
    df = get_dataframe(dataset_id, session)
    if column != "Entire Dataset" and column not in df.columns:
        raise HTTPException(status_code=400, detail="Column not found")
        
    detection_result = detect_issues(dataset_id, session)
    issues = detection_result.get("issues", [])
    
    target_issue = None
    for issue in issues:
        if issue["column"] == column:
            target_issue = issue["issue"]
            break
            
    if column == "Entire Dataset" and any(i["issue"] == "Duplicate Rows" for i in issues):
         target_issue = "Duplicate Rows"
         
    if not target_issue:
        # Fallback diagnostics
        if column != "Entire Dataset" and df[column].isnull().sum() > 0:
            target_issue = "Missing Values"
        else:
            target_issue = "Unknown Issue"

    strategies_to_test = []
    is_numeric = column in df.columns and pd.api.types.is_numeric_dtype(df[column])
    
    # Conditional AI Routing Tree based on diagnostic issue
    if target_issue == "Missing Values":
        if is_numeric:
            strategies_to_test = ["Mean Imputation", "Median Imputation", "KNN Imputation", "Regression Imputation"]
            # Row Deletion / Drop logic isn't natively built in simulate_repair under missing variables yet, falling back to 4 explicit numerical algorithms
        else:
            strategies_to_test = ["Mode Replacement", "Fill with 'Unknown'"]
    elif target_issue == "Outliers":
        strategies_to_test = ["Outlier Removal"]
    elif target_issue == "Duplicate Rows":
        strategies_to_test = ["Duplicate Removal"]
    elif target_issue == "Incorrect Data Type":
        strategies_to_test = ["Type Conversion"]
    elif target_issue == "Skewed Distribution":
        strategies_to_test = ["Median Imputation", "Type Conversion"] # Fallback for skewed attempts
    else:
        strategies_to_test = ["Mean Imputation", "Median Imputation", "Mode Replacement"]
        
    # Strictly bind maximum 5 simulations to protect RAM GC 
    strategies_to_test = strategies_to_test[:5]
    
    comparison_results = []
    
    for strategy in strategies_to_test:
        sim_result = simulate_repair(dataset_id, column, strategy, session)
        if "error" in sim_result:
            continue
            
        mean_before = sim_result.get("mean_before")
        mean_after = sim_result.get("mean_after")
        
        distortion = "High"
        distortion_num = 1.0
        
        if mean_before is not None and mean_after is not None and mean_before != 0:
            shift_pct = abs((mean_after - mean_before) / mean_before)
            distortion_num = shift_pct
            if shift_pct <= 0.05:
                distortion = "Very Low"
            elif shift_pct <= 0.15:
                distortion = "Low"
            elif shift_pct <= 0.30:
                distortion = "Medium"
            else:
                distortion = "High"
        else:
            # Handle categorical / non-mean comparisons
            missing_val_resolved = target_issue == "Missing Values" and sim_result.get("missing_after") == 0
            if missing_val_resolved:
                distortion = "Low"
                distortion_num = 0.1
            else:
                distortion = "Medium"
                distortion_num = 0.5
                
        comparison_results.append({
            "strategy": strategy,
            "health_score": sim_result["health_score_after"],
            "missing_after": sim_result["missing_after"],
            "distortion": distortion,
            "_distortion_val": distortion_num
        })
        
    # Rank explicitly by Maximum Health Bound -> Minimum Distortion Bound
    comparison_results.sort(key=lambda x: (-x["health_score"], x["_distortion_val"]))
    
    ranked_strategies = []
    for idx, res in enumerate(comparison_results):
        res["rank"] = idx + 1
        ranked_strategies.append(res["strategy"])
        del res["_distortion_val"] # wipe private metric
        
    best_strategy = ranked_strategies[0] if ranked_strategies else None

    return {
        "column": column,
        "best_strategy": best_strategy,
        "comparison": comparison_results
    }
