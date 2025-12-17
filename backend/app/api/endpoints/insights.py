from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.services import insight_service

router = APIRouter()

@router.get("/{dataset_id}")
def get_insights(dataset_id: int, session: Session = Depends(get_session)):
    return insight_service.generate_insights(dataset_id, session)
