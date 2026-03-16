from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session
from app.core.database import get_session
from app.services.version_service import get_version_history, restore_version

router = APIRouter()

class RestoreRequest(BaseModel):
     dataset_id: int

@router.get("/{dataset_id}")
def get_dataset_versions(dataset_id: int, session: Session = Depends(get_session)):
    """Yields hierarchical json array explicitly outlining version history bounds."""
    return get_version_history(dataset_id, session)

@router.post("/restore")
def run_restore(req: RestoreRequest, session: Session = Depends(get_session)):
    """Verifies target limits explicitly clearing frontend cache rendering target ID visually."""
    return restore_version(req.dataset_id, session)
