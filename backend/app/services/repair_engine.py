import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.dataset import Dataset
from app.services.eda_service import get_dataframe
from app.services.issue_detection import detect_issues, calculate_health_score
from app.services.confidence_engine import calculate_repair_confidence
from app.services.risk_engine import calculate_repair_risk
from sklearn.impute import KNNImputer
from sklearn.linear_model import LinearRegression

def generate_recommendations(dataset_id: int, session: Session):
    detection_result = detect_issues(dataset_id, session)
    issues = detection_result.get("issues", [])
    df = get_dataframe(dataset_id, session)
    
    recommendations = []
    
    # Pre-calculate correlation for regression suggestions
    corr_matrix = None
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr()
        
    for issue in issues:
        col = issue["column"]
        issue_type = issue["issue"]
        
        rec = {
            "column": col,
            "issue": issue_type,
            "recommended_strategy": "",
            "confidence_score": 0,
            "explanation": "",
            "alternatives": []
        }
        
        if issue_type == "Missing Values":
            if pd.api.types.is_numeric_dtype(df[col]):
                skew_val = df[col].skew()
                
                # Check for high correlation > 0.8
                high_corr = False
                if corr_matrix is not None and col in corr_matrix.columns:
                    correlations = corr_matrix[col].drop(col, errors='ignore')
                    if (correlations.abs() > 0.8).any():
                        high_corr = True
                        
                if high_corr:
                    rec["recommended_strategy"] = "Regression Imputation"
                    rec["confidence_score"] = calculate_repair_confidence(col, issue_type, df, "Regression Imputation", corr_matrix)
                    rec["explanation"] = "High correlation with other columns detected. Regression provides precise estimation."
                    rec["alternatives"] = ["KNN Imputation", "Median Imputation", "Mean Imputation"]
                elif abs(skew_val) >= 1:
                    rec["recommended_strategy"] = "Median Imputation"
                    rec["confidence_score"] = calculate_repair_confidence(col, issue_type, df, "Median Imputation", corr_matrix)
                    rec["explanation"] = f"Distribution is skewed (skew={skew_val:.2f}). Median provides more stable estimation."
                    rec["alternatives"] = ["Mean Imputation", "KNN Imputation"]
                else:
                    rec["recommended_strategy"] = "Mean Imputation"
                    rec["confidence_score"] = calculate_repair_confidence(col, issue_type, df, "Mean Imputation", corr_matrix)
                    rec["explanation"] = "Distribution is relatively symmetric. Mean imputation is safe and effective."
                    rec["alternatives"] = ["Median Imputation", "KNN Imputation"]
            else:
                rec["recommended_strategy"] = "Mode Replacement"
                rec["confidence_score"] = calculate_repair_confidence(col, issue_type, df, "Mode Replacement", corr_matrix)
                rec["explanation"] = "Categorical data requires mode replacement or explicitly labeling as 'Unknown'."
                rec["alternatives"] = ["Fill with 'Unknown'", "Drop Rows"]
                
        elif issue_type == "Duplicate Rows":
            rec["recommended_strategy"] = "Duplicate Removal"
            rec["confidence_score"] = calculate_repair_confidence(col, issue_type, df, "Duplicate Removal", corr_matrix)
            rec["explanation"] = "Identical rows detected. Safe to remove to avoid analysis bias."
            rec["alternatives"] = ["Keep Rows"]
            
        elif issue_type == "Outliers":
            rec["recommended_strategy"] = "Outlier Removal"
            rec["confidence_score"] = calculate_repair_confidence(col, issue_type, df, "Outlier Removal", corr_matrix)
            rec["explanation"] = "Outliers may distort statistical models. Consider removal or transformation."
            rec["alternatives"] = ["Cap at IQR Bounds", "Keep Outliers"]
            
        elif issue_type == "Incorrect Data Type":
            rec["recommended_strategy"] = "Type Conversion"
            rec["confidence_score"] = calculate_repair_confidence(col, issue_type, df, "Type Conversion", corr_matrix)
            rec["explanation"] = "Data format restricts calculations. Converting to Number is highly recommended."
            rec["alternatives"] = []
            
        elif issue_type == "Skewed Distribution":
            rec["recommended_strategy"] = "Log Transformation"
            rec["confidence_score"] = calculate_repair_confidence(col, issue_type, df, "Log Transformation", corr_matrix)
            rec["explanation"] = "Highly skewed variables can compromise model assumptions. Log scale normalizes them."
            rec["alternatives"] = ["Keep As Is"]
            
        if rec["recommended_strategy"]:
            # De-duplicate issues (in case of multiple outliers messages for same col, etc.)
            recommendations.append(rec)
            
    return {
        "dataset_id": dataset_id,
        "health_score": detection_result["health_score"],
        "recommendations": recommendations,
        "issues": issues
    }

_df_stats_cache = {}

def get_df_stats(df: pd.DataFrame, column: str):
    total_rows = len(df)
    total_cells = total_rows * len(df.columns)
    
    missing_count = int(df[column].isnull().sum()) if column in df.columns else 0
    mean_val = float(df[column].mean()) if column in df.columns and pd.api.types.is_numeric_dtype(df[column]) else None
    median_val = float(df[column].median()) if column in df.columns and pd.api.types.is_numeric_dtype(df[column]) else None
    
    df_id = id(df)
    if df_id in _df_stats_cache:
        global_metrics = _df_stats_cache[df_id]
    else:
        missing_ratio = float(df.isnull().sum().sum()) / total_cells if total_cells > 0 else 0
        duplicate_ratio = float(df.duplicated().sum()) / total_rows if total_rows > 0 else 0
        outlier_ratio = 0
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            total_outliers = 0
            for col in numeric_cols:
                 Q1 = df[col].quantile(0.25)
                 Q3 = df[col].quantile(0.75)
                 IQR = Q3 - Q1
                 outlier_mask = (df[col] < Q1 - 1.5 * IQR) | (df[col] > Q3 + 1.5 * IQR)
                 total_outliers += outlier_mask.sum()
            outlier_ratio = float(total_outliers) / total_cells if total_cells > 0 else 0
            
        global_metrics = {
             "missing_ratio": missing_ratio,
             "duplicate_ratio": duplicate_ratio,
             "outlier_ratio": outlier_ratio
        }
        _df_stats_cache[df_id] = global_metrics
        if len(_df_stats_cache) > 100:
             _df_stats_cache.pop(next(iter(_df_stats_cache)))
             
    type_error_ratio = 0 
    
    health_score = calculate_health_score(
        global_metrics["missing_ratio"], 
        global_metrics["duplicate_ratio"], 
        global_metrics["outlier_ratio"], 
        type_error_ratio
    )
    
    distribution = []
    if column in df.columns and pd.api.types.is_numeric_dtype(df[column]):
        counts, bins = np.histogram(df[column].dropna(), bins=10)
        distribution = [{"bin": f"{bins[i]:.2f}-{bins[i+1]:.2f}", "count": int(c)} for i, c in enumerate(counts)]
        
    return {
        "missing": missing_count,
        "mean": mean_val,
        "median": median_val,
        "health_score": health_score,
        "distribution": distribution
    }


def simulate_repair(dataset_id: int, column: str, strategy: str, session: Session):
    """
    Simulates the effect of a repair strategy without modifying the original dataset.
    """
    df = get_dataframe(dataset_id, session)
    if column != "Entire Dataset" and column not in df.columns:
        raise HTTPException(status_code=400, detail="Column not found")
        
    df_copy = df.copy()
    stats_before = get_df_stats(df, column) if column != "Entire Dataset" else get_df_stats(df, df.columns[0])
    
    applied = False
    if strategy == "Mean Imputation":
        if pd.api.types.is_numeric_dtype(df_copy[column]):
            df_copy[column] = df_copy[column].fillna(df_copy[column].mean())
            applied = True
    elif strategy == "Median Imputation":
        if pd.api.types.is_numeric_dtype(df_copy[column]):
            df_copy[column] = df_copy[column].fillna(df_copy[column].median())
            applied = True
    elif strategy == "Mode Replacement":
        mode_val = df_copy[column].mode()
        if not mode_val.empty:
            df_copy[column] = df_copy[column].fillna(mode_val[0])
            applied = True
    elif strategy == "KNN Imputation":
        numeric_cols = df_copy.select_dtypes(include=[np.number]).columns
        if column in numeric_cols:
             imputer = KNNImputer(n_neighbors=5)
             df_copy[numeric_cols] = imputer.fit_transform(df_copy[numeric_cols])
             applied = True
    elif strategy == "Regression Imputation":
        numeric_cols = df_copy.select_dtypes(include=[np.number]).columns
        if column in numeric_cols and len(numeric_cols) > 1:
            train_data = df_copy.dropna(subset=numeric_cols)
            test_data = df_copy[df_copy[column].isnull()]
            if not train_data.empty and not test_data.empty:
                predictors = [c for c in numeric_cols if c != column]
                model = LinearRegression()
                model.fit(train_data[predictors], train_data[column])
                test_predictors = test_data[predictors].fillna(train_data[predictors].mean())
                predictions = model.predict(test_predictors)
                df_copy.loc[df_copy[column].isnull(), column] = predictions
                applied = True
    elif strategy == "Duplicate Removal":
        df_copy = df_copy.drop_duplicates()
        applied = True
    elif strategy == "Outlier Removal":
        if pd.api.types.is_numeric_dtype(df_copy[column]):
            Q1 = df_copy[column].quantile(0.25)
            Q3 = df_copy[column].quantile(0.75)
            IQR = Q3 - Q1
            df_copy = df_copy[~((df_copy[column] < Q1 - 1.5 * IQR) | (df_copy[column] > Q3 + 1.5 * IQR))]
            applied = True
    elif strategy == "Type Conversion":
        df_copy[column] = pd.to_numeric(df_copy[column], errors="coerce")
        applied = True
    elif strategy == "Fill with 'Unknown'":
        df_copy[column] = df_copy[column].fillna("Unknown")
        applied = True

    if not applied:
        return {"error": "Strategy could not be applied to the specified column"}

    stats_after = get_df_stats(df_copy, column) if column != "Entire Dataset" else get_df_stats(df_copy, df.columns[0])
    
    # Calculate explicit structural distribution histograms if numeric
    hist_before = []
    hist_after = []
    bins_bound = []
    
    if column != "Entire Dataset" and pd.api.types.is_numeric_dtype(df[column]):
        # Dropna to avoid NumPy exception on bounds
        valid_before = df[column].dropna()
        valid_after = df_copy[column].dropna()
        
        if not valid_before.empty and not valid_after.empty:
             val_before, bin_edges = np.histogram(valid_before, bins=30)
             val_after, _ = np.histogram(valid_after, bins=bin_edges)
             
             hist_before = val_before.tolist()
             hist_after = val_after.tolist()
             bins_bound = bin_edges.tolist()
             
    risk_metrics = calculate_repair_risk(df, df_copy)
    
    return {
        "column": column,
        "strategy": strategy,
        "missing_before": stats_before["missing"] if column != "Entire Dataset" else 0,
        "missing_after": stats_after["missing"] if column != "Entire Dataset" else 0,
        "mean_before": round(stats_before["mean"], 2) if stats_before.get("mean") is not None else None,
        "mean_after": round(stats_after["mean"], 2) if stats_after.get("mean") is not None else None,
        "median_before": round(stats_before["median"], 2) if stats_before.get("median") is not None else None,
        "median_after": round(stats_after["median"], 2) if stats_after.get("median") is not None else None,
        "distribution_before": stats_before["distribution"],
        "distribution_after": stats_after["distribution"],
        "health_score_before": stats_before["health_score"],
        "health_score_after": stats_after["health_score"],
        "row_count_before": len(df),
        "row_count_after": len(df_copy),
        "histogram_before": hist_before,
        "histogram_after": hist_after,
        "histogram_bins": bins_bound,
        **risk_metrics
    }

