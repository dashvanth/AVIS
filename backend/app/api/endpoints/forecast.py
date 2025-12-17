from fastapi import APIRouter, Depends
from sqlmodel import Session
from pydantic import BaseModel
from app.core.database import get_session
from app.services import forecast_service

router = APIRouter()

class ForecastRequest(BaseModel):
    date_col: str
    value_col: str
    periods: int = 30

@router.post("/{dataset_id}", response_model=list)
def generate_forecast(
    dataset_id: int, 
    request: ForecastRequest, 
    session: Session = Depends(get_session)
):
    return forecast_service.generate_forecast(
        dataset_id, 
        request.date_col, 
        request.value_col, 
        request.periods, 
        session
    )
