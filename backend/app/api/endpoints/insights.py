from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.services import export_service

router = APIRouter()

@router.get("/{dataset_id}")
def get_research_report(dataset_id: int, session: Session = Depends(get_session)):
    return export_service.generate_research_report(dataset_id, session)
