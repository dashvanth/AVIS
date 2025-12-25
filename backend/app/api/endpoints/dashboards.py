from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from app.core.database import get_session
from app.models.dashboard import Dashboard
from app.services import dashboard_service

router = APIRouter()

class DashboardCreate(BaseModel):
    """Schema for validating new visualization snapshots."""
    name: str = Field(..., min_length=1, max_length=100)
    layout_config: Dict[str, Any] # Validates that the config is a proper JSON object

@router.post("/{dataset_id}", response_model=Dashboard, status_code=status.HTTP_201_CREATED)
def create_snapshot(
    dataset_id: int, 
    dashboard_in: DashboardCreate, 
    session: Session = Depends(get_session)
):
    """
    Functionality 4.1: Persist Visualization Snapshot.
    Saves a specific chart configuration (X, Y, Type) for forensic recall.
    """
    return dashboard_service.create_dashboard(
        dataset_id=dataset_id, 
        name=dashboard_in.name, 
        config=dashboard_in.layout_config, 
        session=session
    )

@router.get("/{dataset_id}", response_model=List[Dashboard])
def list_snapshots(dataset_id: int, session: Session = Depends(get_session)):
    """Retrieves all saved views associated with a specific dataset node."""
    return dashboard_service.get_dashboards(dataset_id, session)

@router.delete("/{dashboard_id}")
def purge_snapshot(dashboard_id: int, session: Session = Depends(get_session)):
    """Removes a specific saved view from the persistence layer."""
    success = dashboard_service.delete_dashboard(dashboard_id, session)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Snapshot node not found in database."
        )
    return {"status": "Snapshot purged successfully"}