from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session
from app.core.database import get_session
from app.services.health_evolution import track_health_evolution
from app.services.repair_trace import generate_repair_trace

router = APIRouter()

class TraceRequest(BaseModel):
    dataset_id: int
    column: str
    strategy: str

class TimelineRequest(BaseModel):
    repair_steps: list[dict]

@router.post("/timeline/{dataset_id}")
def get_timeline(dataset_id: int, req: TimelineRequest, session: Session = Depends(get_session)):
    """Fetch health evolution timeline given a sequence of applied or staged repair permutations."""
    return track_health_evolution(dataset_id, req.repair_steps, session)

@router.post("/trace")
def get_repair_trace(req: TraceRequest, session: Session = Depends(get_session)):
    """Yield a comprehensively structured JSON document explicitly defining the statistical rationale driving the fix."""
    return generate_repair_trace(req.dataset_id, req.column, req.strategy, session)
