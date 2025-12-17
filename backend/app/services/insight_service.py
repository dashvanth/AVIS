import pandas as pd
import numpy as np
from sqlmodel import Session
from app.services.eda_service import get_dataframe

def generate_insights(dataset_id: int, session: Session):
    df = get_dataframe(dataset_id, session)
    insights = []
    
    # 1. Missing Value Analysis
    missing_counts = df.isnull().sum()
    missing_cols = missing_counts[missing_counts > 0]
    
    if not missing_cols.empty:
        for col, count in missing_cols.items():
            pct = (count / len(df)) * 100
            if pct > 50:
                insights.append({
                    "type": "recommendation",
                    "severity": "high",
                    "column": col,
                    "message": f"Column '{col}' has {pct:.1f}% missing values. Consider dropping it."
                })
            elif pct > 5:
                insights.append({
                    "type": "recommendation",
                    "severity": "medium",
                    "column": col,
                    "message": f"Column '{col}' has {pct:.1f}% missing values. Consider imputation (mean/median/mode)."
                })
    else:
         insights.append({
            "type": "insight",
            "severity": "low",
            "column": "Dataset",
            "message": "Data is clean! No missing values detected."
        })

    # 2. Correlation Analysis (Numeric)
    numeric_df = df.select_dtypes(include=[np.number])
    if not numeric_df.empty and len(numeric_df.columns) > 1:
        corr_matrix = numeric_df.corr().abs()
        # Iterate over upper triangle
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                col1 = corr_matrix.columns[i]
                col2 = corr_matrix.columns[j]
                val = corr_matrix.iloc[i, j]
                
                if val > 0.85:
                    insights.append({
                        "type": "insight",
                        "severity": "high",
                        "column": f"{col1} & {col2}",
                        "message": f"Strong correlation ({val:.2f}) detected between '{col1}' and '{col2}'. This may indicate multicollinearity."
                    })

    # 3. Skewness Analysis
    if not numeric_df.empty:
        skew_vals = numeric_df.skew()
        for col, val in skew_vals.items():
            if abs(val) > 1:
                direction = "right (positive)" if val > 0 else "left (negative)"
                insights.append({
                    "type": "insight",
                    "severity": "medium",
                    "column": col,
                    "message": f"Column '{col}' is highly skewed to the {direction} (skew={val:.2f}). Consider Log or Box-Cox transformation for better model performance."
                })

    # 4. Cardinality Analysis (Categorical)
    categorical_df = df.select_dtypes(exclude=[np.number])
    for col in categorical_df.columns:
        unique_count = df[col].nunique()
        if unique_count > 50 and unique_count < len(df):
            insights.append({
                "type": "recommendation",
                "severity": "low",
                "column": col,
                "message": f"Column '{col}' has high cardinality ({unique_count} unique values). Be careful using One-Hot Encoding."
            })
        elif unique_count == 1:
             insights.append({
                "type": "recommendation",
                "severity": "medium",
                "column": col,
                "message": f"Column '{col}' has only 1 unique value. It provides no information and can be dropped."
            })

    return insights
