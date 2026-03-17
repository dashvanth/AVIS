import os
import pandas as pd
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session
from app.core.database import get_session
from app.models.dataset import Dataset
from app.services.repair_engine import generate_recommendations, simulate_repair, apply_strategy
from app.services.eda_service import get_dataframe
from app.services.dataset_service import calculate_quality_score
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
def apply_repair_endpoint(req: SimulationRequest, session: Session = Depends(get_session)):
    """
    Apply the repair to the dataframe, save as a distinct new version 
    to preserve original data, and insert into the database.
    CRITICAL: Never overwrite the original. Always create new version.
    """
    original_dataset = session.get(Dataset, req.dataset_id)
    if not original_dataset:
        raise HTTPException(status_code=404, detail="Original dataset not found")
        
    df_original = get_dataframe(req.dataset_id, session)
    
    # CRITICAL: Work on a copy — never mutate original
    df = df_original.copy()
    
    column = req.column
    strategy = req.strategy
    
    # Count rows before
    rows_before = len(df)
    
    # Apply strategy using shared function
    df, applied = apply_strategy(df, column, strategy)
    
    if not applied:
        raise HTTPException(status_code=400, detail="Strategy could not be safely applied to the specified column.")
    
    # Count what changed
    rows_after = len(df)
    if column != "Entire Dataset" and rows_before == rows_after:
        # Cell-level changes
        changed_mask = (df_original[column] != df[column]) | (df_original[column].isna() != df[column].isna())
        rows_modified = int(changed_mask.sum())
    else:
        # Row-level changes (duplicate/outlier removal)
        rows_modified = rows_before - rows_after
    
    # Generate versioned filename
    import time
    timestamp = int(time.time())
    
    base_name = original_dataset.filename.rsplit('.', 1)[0]
    new_filename = f"{base_name}_v{timestamp}_repaired.csv"
    new_filepath = os.path.join(os.path.dirname(original_dataset.filepath), new_filename)
    
    # Save repaired CSV
    df.to_csv(new_filepath, index=False)
    
    # Recalculate quality score on repaired data
    new_quality = calculate_quality_score(df)
    
    new_dataset = Dataset(
        filename=new_filename,
        filepath=new_filepath,
        file_type="csv",
        file_size_bytes=os.path.getsize(new_filepath),
        row_count=len(df),
        column_count=len(df.columns),
        quality_score=new_quality["score"],
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
        "new_dataset_id": new_dataset.id,
        "new_filename": new_dataset.filename,
        "column": column,
        "strategy": strategy,
        "rows_modified": rows_modified,
        "row_count_before": rows_before,
        "row_count_after": rows_after,
        "quality_score": new_quality["score"]
    }
