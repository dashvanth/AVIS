import pandas as pd
import numpy as np

def calculate_repair_confidence(column: str, issue_type: str, df: pd.DataFrame, strategy: str, corr_matrix: pd.DataFrame | None = None) -> float:
    """
    Quantifies the reliability of a recommended repair using dataset statistics.
    Returns a normalized score between 0 and 1.
    """
    total_rows = len(df)
    if total_rows == 0:
        return 0.0

    missing_ratio = float(df[column].isnull().sum()) / total_rows if column in df.columns else 0
    
    # 1. Missing Ratio Score (0 to 1, higher missing -> lower score)
    # If missing ratio is < 5%, score is 1. If > 50%, score drops significantly.
    missing_ratio_score = max(0.0, 1.0 - (missing_ratio * 1.5))
    
    # 2. Skew Score (0 to 1, higher skew -> impacts mean imputation, favors median)
    skew_score = 1.0
    is_numeric = column in df.columns and pd.api.types.is_numeric_dtype(df[column])
    skew_val = df[column].skew() if is_numeric else 0
    
    if is_numeric:
        abs_skew = abs(skew_val)
        if strategy == "Mean Imputation":
            skew_score = max(0.0, 1.0 - (abs_skew / 3.0)) # severely penalized if skew > 3
        elif strategy == "Median Imputation":
            skew_score = min(1.0, 0.5 + (abs_skew / 6.0)) # rewarded for skewness
        elif strategy == "Regression Imputation":
            skew_score = max(0.0, 1.0 - (abs_skew / 5.0))
            
    # 3. Correlation Score (0 to 1)
    correlation_score = 0.5 # default
    if is_numeric and corr_matrix is not None and column in corr_matrix.columns:
        corrs = corr_matrix[column].drop(column, errors='ignore').abs()
        max_corr = corrs.max() if not corrs.empty and not pd.isna(corrs.max()) else 0
        if strategy == "Regression Imputation":
            correlation_score = max_corr
        elif strategy == "KNN Imputation":
            correlation_score = max_corr * 0.9 # KNN benefits from correlation too
            
    # 4. Sample Size Score (0 to 1)
    # Penalize very small datasets (< 50 rows)
    sample_size_score = min(1.0, total_rows / 500.0) 
    
    # Combine based on strategy type
    if issue_type == "Missing Values" and is_numeric:
        confidence = (0.4 * missing_ratio_score) + (0.3 * skew_score) + (0.2 * correlation_score) + (0.1 * sample_size_score)
    elif issue_type == "Missing Values" and not is_numeric:
        confidence = (0.7 * missing_ratio_score) + (0.3 * sample_size_score)
        if strategy == "Mode Replacement":
            # Penalize mode replacement if the mode is weak
            mode_counts = df[column].value_counts(normalize=True)
            if not mode_counts.empty:
                confidence *= mode_counts.iloc[0] # scale by mode dominance
    elif issue_type == "Duplicate Rows":
        confidence = 0.95 # highly confident in exact duplicates
    elif issue_type in ("Outliers", "Skewed Distribution"):
        confidence = (0.6 * skew_score) + (0.4 * sample_size_score)
    elif issue_type == "Incorrect Data Type":
        confidence = 0.90
    else:
        confidence = 0.70

    # Ensure bounds
    return float(np.clip(confidence, 0.0, 1.0))
