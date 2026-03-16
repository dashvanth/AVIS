import pandas as pd
from sqlalchemy.orm import Session
from app.services.eda_service import get_dataframe
from app.services.repair_engine import get_df_stats
# We will duplicate the apply behavior safely here to run sequential tests
from sklearn.impute import KNNImputer
from sklearn.linear_model import LinearRegression
import numpy as np

def track_health_evolution(dataset_id: int, repair_steps: list[dict], session: Session) -> dict:
    """
    Computes a timeline of health score improvements based on consecutive simulated repairs.
    repair_steps expects a list of dicts: [{"column": "Age", "strategy": "Median Imputation"}, ...]
    """
    df_copy = get_dataframe(dataset_id, session).copy()
    
    # Base score
    base_stats = get_df_stats(df_copy, df_copy.columns[0])
    timeline = [{
        "step": "Initial Dataset",
        "health_score": base_stats["health_score"]
    }]
    
    for step in repair_steps:
        column = step.get("column")
        strategy = step.get("strategy")
        if not column or not strategy or column not in df_copy.columns and column != "Entire Dataset":
            continue
            
        # Apply the logic
        if strategy == "Mean Imputation" and pd.api.types.is_numeric_dtype(df_copy[column]):
            df_copy[column] = df_copy[column].fillna(df_copy[column].mean())
        elif strategy == "Median Imputation" and pd.api.types.is_numeric_dtype(df_copy[column]):
            df_copy[column] = df_copy[column].fillna(df_copy[column].median())
        elif strategy == "Mode Replacement":
            mode_val = df_copy[column].mode()
            if not mode_val.empty:
                df_copy[column] = df_copy[column].fillna(mode_val[0])
        elif strategy == "KNN Imputation":
            num_cols = df_copy.select_dtypes(include=[np.number]).columns
            if column in num_cols:
                df_copy[num_cols] = KNNImputer(n_neighbors=5).fit_transform(df_copy[num_cols])
        elif strategy == "Regression Imputation":
            num_cols = df_copy.select_dtypes(include=[np.number]).columns
            if column in num_cols and len(num_cols) > 1:
                train_data = df_copy.dropna(subset=num_cols)
                test_data = df_copy[df_copy[column].isnull()]
                if not train_data.empty and not test_data.empty:
                    preds = [c for c in num_cols if c != column]
                    model = LinearRegression().fit(train_data[preds], train_data[column])
                    df_copy.loc[df_copy[column].isnull(), column] = model.predict(test_data[preds].fillna(train_data[preds].mean()))
        elif strategy == "Duplicate Removal":
            df_copy = df_copy.drop_duplicates()
        elif strategy == "Outlier Removal" and pd.api.types.is_numeric_dtype(df_copy[column]):
            Q1 = df_copy[column].quantile(0.25)
            Q3 = df_copy[column].quantile(0.75)
            IQR = Q3 - Q1
            df_copy = df_copy[~((df_copy[column] < Q1 - 1.5*IQR) | (df_copy[column] > Q3 + 1.5*IQR))]
        elif strategy == "Type Conversion":
             df_copy[column] = pd.to_numeric(df_copy[column], errors="coerce")
        elif strategy == "Fill with 'Unknown'":
             df_copy[column] = df_copy[column].fillna("Unknown")

        # Recalculate global health
        curr_stats = get_df_stats(df_copy, df_copy.columns[0])
        timeline.append({
            "step": f"{strategy} ({column})",
            "health_score": curr_stats["health_score"]
        })
        
    return {"timeline": timeline}
