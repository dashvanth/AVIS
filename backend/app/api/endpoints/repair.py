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

class ApplyAllRequest(BaseModel):
    dataset_id: int

@router.get("/recommendations/{dataset_id}")
def get_recommendations(dataset_id: int, session: Session = Depends(get_session)):
    """Fetch structured repair recommendations for given dataset."""
    return generate_recommendations(dataset_id, session)

@router.post("/simulate")
def run_simulation(req: SimulationRequest, session: Session = Depends(get_session)):
    """Dry-run the proposed statistical strategy on a cloned dataset and return metric deltas."""
    return simulate_repair(req.dataset_id, req.column, req.strategy, session)

@router.post("/apply")
def apply_repair_endpoint(req: SimulationRequest, session: Session = Depends(get_session)):
    """
    Apply a SINGLE repair to the dataframe, save as new version, return download info.
    """
    original_dataset = session.get(Dataset, req.dataset_id)
    if not original_dataset:
        raise HTTPException(status_code=404, detail="Original dataset not found")
        
    df_original = get_dataframe(req.dataset_id, session)
    df = df_original.copy()
    
    rows_before = len(df)
    df, applied = apply_strategy(df, req.column, req.strategy)
    
    if not applied:
        raise HTTPException(status_code=400, detail="Strategy could not be applied.")
    
    rows_after = len(df)
    if req.column != "Entire Dataset" and rows_before == rows_after:
        changed_mask = (df_original[req.column] != df[req.column]) | (df_original[req.column].isna() != df[req.column].isna())
        rows_modified = int(changed_mask.sum())
    else:
        rows_modified = rows_before - rows_after
    
    return _save_repaired_dataset(df, original_dataset, req.strategy, rows_modified, rows_before, rows_after, session)


@router.post("/apply_all")
def apply_all_repairs(req: ApplyAllRequest, session: Session = Depends(get_session)):
    """
    Apply ALL safe repairs (missing value fills + duplicate removal) in one batch.
    This is the main repair action — produces a fully cleaned dataset.
    """
    original_dataset = session.get(Dataset, req.dataset_id)
    if not original_dataset:
        raise HTTPException(status_code=404, detail="Original dataset not found")
    
    df_original = get_dataframe(req.dataset_id, session)
    df = df_original.copy()
    rows_before = len(df)
    
    # Get recommendations
    rec_data = generate_recommendations(req.dataset_id, session)
    recs = rec_data.get("recommendations", [])
    
    # Only apply SAFE repairs: Missing Values + Duplicates + Type Conversion
    safe_issues = {"Missing Values", "Duplicate Rows", "Incorrect Data Type"}
    
    repairs_applied = []
    total_modified = 0
    
    # Step 1: Fill missing values (column by column)
    for rec in recs:
        if rec["issue"] != "Missing Values":
            continue
        col = rec["column"]
        strategy = rec["recommended_strategy"]
        df, applied = apply_strategy(df, col, strategy)
        if applied:
            repairs_applied.append({"column": col, "strategy": strategy, "issue": "Missing Values"})
            # Count changes for this column
            if col in df_original.columns:
                missing_filled = int(df_original[col].isna().sum() - df[col].isna().sum())
                total_modified += max(0, missing_filled)
    
    # Step 2: Fix data types
    for rec in recs:
        if rec["issue"] != "Incorrect Data Type":
            continue
        col = rec["column"]
        strategy = rec["recommended_strategy"]
        df, applied = apply_strategy(df, col, strategy)
        if applied:
            repairs_applied.append({"column": col, "strategy": strategy, "issue": "Incorrect Data Type"})
    
    # Step 3: Remove duplicates (do this LAST)
    for rec in recs:
        if rec["issue"] != "Duplicate Rows":
            continue
        before_dup = len(df)
        df, applied = apply_strategy(df, rec["column"], rec["recommended_strategy"])
        if applied:
            removed = before_dup - len(df)
            total_modified += removed
            repairs_applied.append({"column": "Entire Dataset", "strategy": "Duplicate Removal", "issue": "Duplicate Rows"})
    
    rows_after = len(df)
    
    if not repairs_applied:
        raise HTTPException(status_code=400, detail="No repairs could be applied to this dataset.")
    
    # Build strategy summary
    strategy_summary = ", ".join([f"{r['strategy']} on {r['column']}" for r in repairs_applied])
    
    result = _save_repaired_dataset(df, original_dataset, strategy_summary, total_modified, rows_before, rows_after, session)
    result["repairs_applied"] = repairs_applied
    return result


def _save_repaired_dataset(
    df: pd.DataFrame, 
    original_dataset: Dataset, 
    strategy: str, 
    rows_modified: int, 
    rows_before: int, 
    rows_after: int, 
    session: Session
):
    """Save repaired DataFrame as a new dataset entry and return response."""
    # Clean filename: originalname_repaired.csv
    original_name = original_dataset.filename
    clean_base = original_name.rsplit('.', 1)[0].replace('_repaired', '')
    ext = original_name.rsplit('.', 1)[1] if '.' in original_name else 'csv'
    new_filename = f"{clean_base}_repaired.{ext}"
    new_filepath = os.path.join(os.path.dirname(original_dataset.filepath), new_filename)
    
    # Save repaired dataset
    df.to_csv(new_filepath, index=False)
    
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
        "original_dataset_id": original_dataset.id,
        "column": "All Columns",
        "strategy": strategy,
        "rows_modified": rows_modified,
        "row_count_before": rows_before,
        "row_count_after": rows_after,
        "quality_score": new_quality["score"]
    }
