from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session
from app.core.database import get_session
from app.services.strategy_comparison import compare_repair_strategies

router = APIRouter()

class CompareRequest(BaseModel):
    dataset_id: int
    column: str

@router.post("/compare")
def compare_strategies(req: CompareRequest, session: Session = Depends(get_session)):
    """Yields a ranked mathematical classification grouping simulated repair attempts against a singular array feature."""
    return compare_repair_strategies(req.dataset_id, req.column, session)
