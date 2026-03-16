import pandas as pd
from sqlalchemy.orm import Session
from app.services.eda_service import get_dataframe
from app.services.repair_engine import simulate_repair
from app.services.issue_detection import detect_issues
from fastapi import HTTPException

def generate_repair_trace(dataset_id: int, column: str, strategy: str, session: Session) -> dict:
    """
    Generates a full explainable trace comparing before/after effects.
    """
    df = get_dataframe(dataset_id, session)
    if column != "Entire Dataset" and column not in df.columns:
        raise HTTPException(status_code=400, detail="Column not found")
        
    # Get initial issue context
    detection_result = detect_issues(dataset_id, session)
    issues = detection_result.get("issues", [])
    
    target_issue = "Unknown Issue"
    for issue in issues:
        if issue["column"] == column:
            target_issue = issue["issue"]
            break
            
    if column == "Entire Dataset" and any(i["issue"] == "Duplicate Rows" for i in issues):
         target_issue = "Duplicate Rows"

    # Deep statistical markers
    analysis_block = {}
    if column != "Entire Dataset":
        missing_count = int(df[column].isnull().sum())
        analysis_block["missing_ratio"] = round(missing_count / len(df), 4)
        if pd.api.types.is_numeric_dtype(df[column]):
            analysis_block["skewness"] = round(df[column].skew(), 4)
            
    # Reasoning text
    reasoning = "Applied mathematical normalization."
    if strategy == "Median Imputation":
        reasoning = "Median is robust against skewed distributions, preserving the central tendency without outlier distortion."
    elif strategy == "Mean Imputation":
        reasoning = "Mean imputation effectively preserves the symmetry of normally distributed numerical data."
    elif strategy == "Regression Imputation":
        reasoning = "Strong correlations detected. Regression dynamically estimates the most likely value using multi-variable prediction."
    elif strategy == "Duplicate Removal":
        reasoning = "Identical rows artificially boost data volume and cause model bias. De-duplication restores statistical accuracy."
    elif "Unknown" in strategy:
        reasoning = "Categorical columns cannot be averaged. Explicit 'Unknown' labeling preserves data shape without guessing."
    elif strategy == "Mode Replacement":
        reasoning = "Mode securely assumes the most frequent class, creating the lowest possibility of error for categorical data."
    elif strategy == "Type Conversion":
        reasoning = "Data format restrictions obstruct calculations. Coercion unlocks mathematical evaluation."
    elif strategy == "Outlier Removal":
        reasoning = "Anomalies residing outside the Interquartile Range boundary skew linear models."

    # Execute simulation
    sim_result = simulate_repair(dataset_id, column, strategy, session)
    
    if "error" in sim_result:
        raise HTTPException(status_code=400, detail=sim_result["error"])
        
    return {
        "column": column,
        "issue": target_issue,
        "analysis": analysis_block,
        "chosen_strategy": strategy,
        "reason": reasoning,
        "effect": {
            "missing_before": sim_result["missing_before"],
            "missing_after": sim_result["missing_after"],
            "mean_before": sim_result["mean_before"],
            "mean_after": sim_result["mean_after"],
            "health_before": sim_result["health_score_before"],
            "health_after": sim_result["health_score_after"]
        }
    }
