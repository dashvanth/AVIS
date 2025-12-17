from fastapi import APIRouter, Depends, Query
from app.core.database import get_session
from app.core.database import Session
from app.services import viz_service

router = APIRouter()

@router.get("/{dataset_id}/chart")
def get_chart_data(
    dataset_id: int,
    x_col: str = Query(...),
    chart_type: str = Query(...),
    y_col: str = Query(None),
    session: Session = Depends(get_session)
):
    return viz_service.get_chart_data(dataset_id, x_col, chart_type, y_col, session)
