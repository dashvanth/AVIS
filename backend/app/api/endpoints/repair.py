import os
import pandas as pd
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session
from app.core.database import get_session
from app.models.dataset import Dataset
from app.services.repair_engine import generate_recommendations, simulate_repair
from app.services.eda_service import get_dataframe
from datetime import datetime

router = APIRouter()

class SimulationRequest(BaseModel):
    dataset_id: int
    column: str
    strategy: str

@router.get("/recommendations/{dataset_id}")
def get_recommendations(dataset_id: int, session: Session = Depends(get_session)):
    """Fetch structured AI-driven repair recommendations for given dataset."""
    return generate_recommendations(dataset_id, session)

@router.post("/simulate")
def run_simulation(req: SimulationRequest, session: Session = Depends(get_session)):
    """Dry-run the proposed statistical strategy on a cloned dataset and return metric deltas."""
    return simulate_repair(req.dataset_id, req.column, req.strategy, session)

@router.post("/apply")
def apply_repair(req: SimulationRequest, session: Session = Depends(get_session)):
    """Apply the repair to the dataframe, save as a distinct new version to preserve original data, and insert into the database."""
    original_dataset = session.get(Dataset, req.dataset_id)
    if not original_dataset:
        raise HTTPException(status_code=404, detail="Original dataset not found")
        
    df = get_dataframe(req.dataset_id, session)
    
    column = req.column
    strategy = req.strategy
    
    applied = False
    
    if strategy == "Mean Imputation":
        if pd.api.types.is_numeric_dtype(df[column]):
            df[column] = df[column].fillna(df[column].mean())
            applied = True
    elif strategy == "Median Imputation":
        if pd.api.types.is_numeric_dtype(df[column]):
            df[column] = df[column].fillna(df[column].median())
            applied = True
    elif strategy == "Mode Replacement":
        mode_val = df[column].mode()
        if not mode_val.empty:
            df[column] = df[column].fillna(mode_val[0])
            applied = True
    elif strategy == "KNN Imputation":
        from sklearn.impute import KNNImputer
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if column in numeric_cols:
             imputer = KNNImputer(n_neighbors=5)
             df[numeric_cols] = imputer.fit_transform(df[numeric_cols])
             applied = True
    elif strategy == "Regression Imputation":
        from sklearn.linear_model import LinearRegression
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if column in numeric_cols and len(numeric_cols) > 1:
            train_data = df.dropna(subset=numeric_cols)
            test_data = df[df[column].isnull()]
            if not train_data.empty and not test_data.empty:
                predictors = [c for c in numeric_cols if c != column]
                model = LinearRegression()
                model.fit(train_data[predictors], train_data[column])
                test_predictors = test_data[predictors].fillna(train_data[predictors].mean())
                predictions = model.predict(test_predictors)
                df.loc[df[column].isnull(), column] = predictions
                applied = True
    elif strategy == "Duplicate Removal":
        df = df.drop_duplicates()
        applied = True
    elif strategy == "Outlier Removal":
        if pd.api.types.is_numeric_dtype(df[column]):
            Q1 = df[column].quantile(0.25)
            Q3 = df[column].quantile(0.75)
            IQR = Q3 - Q1
            df = df[~((df[column] < Q1 - 1.5 * IQR) | (df[column] > Q3 + 1.5 * IQR))]
            applied = True
    elif strategy == "Type Conversion":
        df[column] = pd.to_numeric(df[column], errors="coerce")
        applied = True
    elif strategy == "Fill with 'Unknown'":
        df[column] = df[column].fillna("Unknown")
        applied = True

    if not applied:
        raise HTTPException(status_code=400, detail="Strategy mapping could not be safely executed.")
        
    import time
    timestamp = int(time.time())
    
    # Strip extension cleanly and add suffix
    base_name = original_dataset.filename.rsplit('.', 1)[0]
    new_filename = f"{base_name}_v{timestamp}_repaired.csv"
    new_filepath = os.path.join(os.path.dirname(original_dataset.filepath), new_filename)
    
    df.to_csv(new_filepath, index=False)
    
    new_dataset = Dataset(
        filename=new_filename,
        filepath=new_filepath,
        file_type="csv",
        file_size_bytes=os.path.getsize(new_filepath),
        row_count=len(df),
        column_count=len(df.columns),
        quality_score=original_dataset.quality_score, 
        processing_log=original_dataset.processing_log,
        forensic_trace=original_dataset.forensic_trace,
        ingestion_insights=original_dataset.ingestion_insights,
        characterization=original_dataset.characterization,
        analyzed=False,
        owner_id=original_dataset.owner_id,
        version_number=original_dataset.version_number + 1,
        parent_dataset_id=original_dataset.id,
        repair_strategy=strategy,
        repair_timestamp=datetime.utcnow()
    )
    
    session.add(new_dataset)
    session.commit()
    session.refresh(new_dataset)
    
    return {
        "status": "success",
        "message": f"Repair fully applied. Safely copied variant to {new_filename}",
        "new_dataset_id": new_dataset.id,
        "new_filename": new_dataset.filename
    }
