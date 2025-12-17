from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.services import eda_service

router = APIRouter()

@router.get("/{dataset_id}/summary")
def get_summary(dataset_id: int, session: Session = Depends(get_session)):
    return eda_service.get_summary_statistics(dataset_id, session)

@router.get("/{dataset_id}/missing")
def get_missing(dataset_id: int, session: Session = Depends(get_session)):
    return eda_service.get_missing_values(dataset_id, session)

@router.get("/{dataset_id}/correlation")
def get_correlation(dataset_id: int, session: Session = Depends(get_session)):
    return eda_service.get_correlation_matrix(dataset_id, session)
