# backend/app/api/endpoints/eda.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from app.services import eda_service

router = APIRouter()

@router.get("/{dataset_id}/summary")
def get_summary(dataset_id: int, session: Session = Depends(get_session)):
    """
    Functionality 3.3: Automated Statistics & Visible Backend Steps.
    Returns quantitative distribution, frequency audits, and automated insights.
    """
    try:
        return eda_service.get_summary_statistics(dataset_id, session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summary Engine Error: {str(e)}")

@router.get("/{dataset_id}/missing")
def get_missing(dataset_id: int, session: Session = Depends(get_session)):
    """
    Functionality 3.1: Missing Value Indicators.
    Precisely identifies 'unstructured' gaps and their impact on data quality.
    """
    try:
        return eda_service.get_missing_values(dataset_id, session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gaps Audit Error: {str(e)}")

@router.get("/{dataset_id}/correlation")
def get_correlation(dataset_id: int, session: Session = Depends(get_session)):
    """
    Functionality 3.2: Relationship Discovery.
    Detects logical connections between variables using the Pearson Method.
    """
    try:
        return eda_service.get_correlation_matrix(dataset_id, session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Relationship Node Error: {str(e)}")