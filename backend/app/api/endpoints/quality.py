from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.services.quality_metrics import compute_quality_metrics

router = APIRouter()

@router.get("/{dataset_id}")
def get_quality_radar(dataset_id: int, session: Session = Depends(get_session)):
    """Yields 5-dimensional structural arrays calculating completeness, uniqueness, and metric consistency natively mapped from 0 to 100."""
    return compute_quality_metrics(dataset_id, session)
