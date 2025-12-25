# backend/app/api/endpoints/eda.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from app.services import eda_service

router = APIRouter()

@router.get("/{dataset_id}/summary")
def get_summary(dataset_id: int, session: Session = Depends(get_session)):
    """
    Functionality 3.3: Visible Backend Steps & Automated Statistics.
    Returns quantitative averages, label patterns, and explicit logic steps
    explaining HOW and WHY these metrics were calculated.
    """
    try:
        # Returns summary stats with attached 'logic_desc' for educational transparency
        return eda_service.get_summary_statistics(dataset_id, session)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Discovery Engine (Basics) Node Failure: {str(e)}"
        )

@router.get("/{dataset_id}/missing")
def get_missing(dataset_id: int, session: Session = Depends(get_session)):
    """
    Functionality 3.1: Gaps Audit Transparency.
    Maps precisely where 'unstructured' holes exist in the matrix.
    """
    try:
        return eda_service.get_missing_values(dataset_id, session)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Forensic Gaps Scan Node Failure: {str(e)}"
        )

@router.get("/{dataset_id}/correlation")
def get_correlation(dataset_id: int, session: Session = Depends(get_session)):
    """
    Functionality 3.2: Relationship Discovery Logic.
    Calculates connections (Symmetry or Conflict) between numeric features
    and provides a natural-language description of the 'Linkage' found.
    """
    try:
        # Returns connection matrix and top discovery sentences for the UI
        return eda_service.get_correlation_matrix(dataset_id, session)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Relationship Discovery Node Failure: {str(e)}"
        )