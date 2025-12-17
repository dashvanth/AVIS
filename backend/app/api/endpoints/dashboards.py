from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from app.core.database import get_session
from app.models.dashboard import Dashboard
from app.services import dashboard_service

router = APIRouter()

class DashboardCreate(BaseModel):
    name: str
    layout_config: Dict[str, Any]

@router.post("/{dataset_id}", response_model=Dashboard)
def create_dashboard(
    dataset_id: int, 
    dashboard_in: DashboardCreate, 
    session: Session = Depends(get_session)
):
    return dashboard_service.create_dashboard(dataset_id, dashboard_in.name, dashboard_in.layout_config, session)

@router.get("/{dataset_id}", response_model=List[Dashboard])
def get_dashboards(dataset_id: int, session: Session = Depends(get_session)):
    return dashboard_service.get_dashboards(dataset_id, session)

@router.delete("/{dashboard_id}")
def delete_dashboard(dashboard_id: int, session: Session = Depends(get_session)):
    success = dashboard_service.delete_dashboard(dashboard_id, session)
    if not success:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return {"ok": True}
