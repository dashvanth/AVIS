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


def detect_column_type(series: pd.Series, column_name: str) -> str:
    """Detect domain-level type to ensure appropriate transformations."""
    name = column_name.lower()
    
    # Check for keywords representing discrete integer values
    discrete_keywords = ["age", "year", "experience", "count", "number", "quantity", "id"]
    if any(keyword in name for keyword in discrete_keywords):
        return "DISCRETE_INT"
        
    # Check if the series (ignoring NaNs) consists purely of integers
    valid_data = series.dropna()
    if not valid_data.empty:
        # Check if float values are actually whole numbers (e.g. 5.0)
        if pd.api.types.is_numeric_dtype(valid_data):
            if (valid_data % 1 == 0).all():
                return "DISCRETE_INT"
    
    if pd.api.types.is_integer_dtype(series.dropna()):
        return "DISCRETE_INT"
        
    if pd.api.types.is_float_dtype(series):
        return "CONTINUOUS"
        
    if pd.api.types.is_object_dtype(series):
        return "CATEGORICAL"
        
    return "UNKNOWN"


def generate_recommendations(dataset_id: int, session: Session):
    """Fetch structured repair recommendations driven by issue detection."""
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
            col_type = detect_column_type(df[col], col)
            
            if col_type in ["DISCRETE_INT", "CONTINUOUS"]:
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
            col_type = detect_column_type(df[col], col)
            if col_type == "CONTINUOUS":
                rec["recommended_strategy"] = "Log Transformation"
                rec["confidence_score"] = calculate_repair_confidence(col, issue_type, df, "Log Transformation", corr_matrix)
                rec["explanation"] = "Highly skewed continuous variables can compromise model assumptions. Log scale normalizes them."
                rec["alternatives"] = ["Keep As Is"]
            else:
                # For DISCRETE_INT, we don't suggest Log Transform by default as it destroys semantic meaning
                rec["recommended_strategy"] = "Cap at IQR Bounds"
                rec["confidence_score"] = calculate_repair_confidence(col, issue_type, df, "Cap at IQR Bounds", corr_matrix)
                rec["explanation"] = "Count-based data shows natural skew. Capping outliers is preferred over log-scaling to preserve unit meaning."
                rec["alternatives"] = ["Keep As Is"]
            
        if rec["recommended_strategy"]:
            recommendations.append(rec)
            
    return {
        "dataset_id": dataset_id,
        "health_score": detection_result["health_score"],
        "recommendations": recommendations,
        "issues": issues
    }


# ─────────────────────────────────────────────────────
# SHARED: Apply a repair strategy to a dataframe copy
# ─────────────────────────────────────────────────────

def apply_strategy(df_copy: pd.DataFrame, column: str, strategy: str) -> tuple[pd.DataFrame, bool]:
    """
    Apply a repair strategy to df_copy (MUST be a copy, never the original).
    Returns (modified_df, was_applied).
    """
    applied = False
    col_type = "UNKNOWN"
    if column != "Entire Dataset" and column in df_copy.columns:
        col_type = detect_column_type(df_copy[column], column)

    if strategy == "Mean Imputation":
        if pd.api.types.is_numeric_dtype(df_copy[column]):
            fill_value = df_copy[column].mean()
            df_copy[column] = df_copy[column].fillna(fill_value)
            applied = True
    elif strategy == "Median Imputation":
        if pd.api.types.is_numeric_dtype(df_copy[column]):
            fill_value = df_copy[column].median()
            df_copy[column] = df_copy[column].fillna(fill_value)
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
    elif strategy == "Log Transformation":
        if pd.api.types.is_numeric_dtype(df_copy[column]):
            # Add 1 to avoid log(0), only transform positive values
            min_val = df_copy[column].min()
            if min_val is not None and min_val > 0:
                df_copy[column] = np.log(df_copy[column])
            else:
                df_copy[column] = np.log1p(df_copy[column] - min_val + 1)
            applied = True
    elif strategy == "Cap at IQR Bounds":
        if pd.api.types.is_numeric_dtype(df_copy[column]):
            Q1 = df_copy[column].quantile(0.25)
            Q3 = df_copy[column].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR
            df_copy[column] = df_copy[column].clip(lower=lower, upper=upper)
            applied = True

    # FINAL STEP: If it's a DISCRETE_INT column, and it's now numeric, cast back to integer to preserve semantics
    if applied and col_type == "DISCRETE_INT" and column in df_copy.columns:
        if pd.api.types.is_numeric_dtype(df_copy[column]):
            # Round values (handles floats from Mean/Regression/KNN) and cast to nullable integer
            df_copy[column] = df_copy[column].round().astype('Int64')

    return df_copy, applied


# ─────────────────────────────────────────────────────
# COMPUTE COLUMN STATS (no caching — deterministic)
# ─────────────────────────────────────────────────────

def compute_column_stats(df: pd.DataFrame, column: str) -> dict:
    """Compute stats for a single column — deterministic, no cache."""
    result = {
        "missing": 0,
        "mean": None,
        "median": None,
        "std": None,
        "skew": None,
        "min": None,
        "max": None
    }
    
    if column not in df.columns:
        return result
    
    result["missing"] = int(df[column].isnull().sum())
    
    if pd.api.types.is_numeric_dtype(df[column]):
        valid = df[column].dropna()
        if len(valid) > 0:
            result["mean"] = round(float(valid.mean()), 4)
            result["median"] = round(float(valid.median()), 4)
            result["std"] = round(float(valid.std()), 4)
            result["skew"] = round(float(valid.skew()), 4)
            result["min"] = round(float(valid.min()), 4)
            result["max"] = round(float(valid.max()), 4)

    return result


# ─────────────────────────────────────────────────────
# SIMULATE REPAIR (research-grade output)
# ─────────────────────────────────────────────────────

def simulate_repair(dataset_id: int, column: str, strategy: str, session: Session):
    """
    Simulates the effect of a repair strategy WITHOUT modifying the original dataset.
    Returns research-grade output: changed_rows, before/after samples, metrics_delta.
    """
    df = get_dataframe(dataset_id, session)
    if column != "Entire Dataset" and column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{column}' not found in dataset")
        
    # CRITICAL: Work on a deep copy only
    df_original = df.copy()
    df_copy = df.copy()
    
    # Compute BEFORE stats
    stat_col = column if column != "Entire Dataset" else df.columns[0]
    stats_before = compute_column_stats(df_original, stat_col)
    
    # Apply strategy
    df_copy, applied = apply_strategy(df_copy, column, strategy)
    
    if not applied:
        return {"error": "Strategy could not be applied to the specified column"}

    # Compute AFTER stats
    stats_after = compute_column_stats(df_copy, stat_col)
    
    # ─── CHANGED ROWS (row-level diff, max 20) ───
    changed_rows = []
    if column != "Entire Dataset" and df_original.shape[0] == df_copy.shape[0]:
        # Same row count — cell-level comparison
        for idx in df_original.index:
            if idx not in df_copy.index:
                continue
            val_before = df_original.at[idx, column]
            val_after = df_copy.at[idx, column]
            
            # Detect change: NaN→value, value→value, or value→NaN
            before_is_na = pd.isna(val_before)
            after_is_na = pd.isna(val_after)
            
            changed = False
            if before_is_na and not after_is_na:
                changed = True
            elif not before_is_na and after_is_na:
                changed = True
            elif not before_is_na and not after_is_na and val_before != val_after:
                changed = True
                
            if changed:
                changed_rows.append({
                    "row_index": int(idx),
                    "column": column,
                    "before": None if before_is_na else _safe_value(val_before),
                    "after": None if after_is_na else _safe_value(val_after)
                })
                if len(changed_rows) >= 20:
                    break
    elif strategy == "Duplicate Removal":
        # Rows were removed — track which indices were dropped
        removed_indices = list(set(df_original.index) - set(df_copy.index))[:20]
        for idx in removed_indices:
            changed_rows.append({
                "row_index": int(idx),
                "column": "Entire Dataset",
                "before": "duplicate row",
                "after": "removed"
            })
    elif strategy == "Outlier Removal":
        removed_indices = list(set(df_original.index) - set(df_copy.index))[:20]
        for idx in removed_indices:
            changed_rows.append({
                "row_index": int(idx),
                "column": column,
                "before": _safe_value(df_original.at[idx, column]),
                "after": "removed (outlier)"
            })
    
    # ─── BEFORE / AFTER SAMPLES (first 10 rows) ───
    before_sample = df_original.head(10).replace({np.nan: None}).to_dict(orient="records")
    after_sample = df_copy.head(10).replace({np.nan: None}).to_dict(orient="records")
    
    # ─── METRICS DELTA ───
    metrics_delta = {
        "missing_before": stats_before["missing"],
        "missing_after": stats_after["missing"],
        "mean_before": stats_before["mean"],
        "mean_after": stats_after["mean"],
        "median_before": stats_before["median"],
        "median_after": stats_after["median"],
        "std_before": stats_before["std"],
        "std_after": stats_after["std"],
        "skew_before": stats_before["skew"],
        "skew_after": stats_after["skew"]
    }
    
    # ─── HEALTH SCORES ───
    total_cells_before = df_original.shape[0] * df_original.shape[1]
    total_cells_after = df_copy.shape[0] * df_copy.shape[1]
    
    missing_ratio_before = float(df_original.isnull().sum().sum()) / total_cells_before if total_cells_before > 0 else 0
    duplicate_ratio_before = float(df_original.duplicated().sum()) / len(df_original) if len(df_original) > 0 else 0
    missing_ratio_after = float(df_copy.isnull().sum().sum()) / total_cells_after if total_cells_after > 0 else 0
    duplicate_ratio_after = float(df_copy.duplicated().sum()) / len(df_copy) if len(df_copy) > 0 else 0
    
    health_before = calculate_health_score(missing_ratio_before, duplicate_ratio_before, 0, 0)
    health_after = calculate_health_score(missing_ratio_after, duplicate_ratio_after, 0, 0)
    
    # ─── HISTOGRAMS (numeric columns only) ───
    hist_before = []
    hist_after = []
    bins_bound = []
    
    if column != "Entire Dataset" and pd.api.types.is_numeric_dtype(df_original[column]):
        valid_before = df_original[column].dropna()
        valid_after = df_copy[column].dropna() if column in df_copy.columns else pd.Series(dtype=float)
        
        if not valid_before.empty and not valid_after.empty:
            val_before, bin_edges = np.histogram(valid_before, bins=30)
            val_after, _ = np.histogram(valid_after, bins=bin_edges)
            
            hist_before = val_before.tolist()
            hist_after = val_after.tolist()
            bins_bound = bin_edges.tolist()
    
    # ─── RISK ANALYSIS ───
    risk_metrics = calculate_repair_risk(df_original, df_copy)
    
    return {
        "column": column,
        "strategy": strategy,
        
        # Row-level traceability
        "changed_rows": changed_rows,
        "rows_modified": len(changed_rows),
        
        # Visual comparison samples
        "before_sample": before_sample,
        "after_sample": after_sample,
        
        # Clean metrics delta
        "metrics_delta": metrics_delta,
        
        # Legacy fields (kept for frontend compatibility)
        "missing_before": stats_before["missing"],
        "missing_after": stats_after["missing"],
        "mean_before": stats_before["mean"],
        "mean_after": stats_after["mean"],
        "median_before": stats_before["median"],
        "median_after": stats_after["median"],
        
        # Distribution
        "distribution_before": stats_before,
        "distribution_after": stats_after,
        
        # Health
        "health_score_before": health_before,
        "health_score_after": health_after,
        
        # Structural
        "row_count_before": len(df_original),
        "row_count_after": len(df_copy),
        
        # Histograms
        "histogram_before": hist_before,
        "histogram_after": hist_after,
        "histogram_bins": bins_bound,
        
        # Risk assessment
        **risk_metrics
    }


def _safe_value(val):
    """Convert numpy types to JSON-safe Python types."""
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return round(float(val), 4)
    if isinstance(val, (np.bool_,)):
        return bool(val)
    return val
