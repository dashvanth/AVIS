# backend/app/api/endpoints/viz.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session
from app.core.database import get_session
from app.services import viz_service

router = APIRouter()

@router.get("/{dataset_id}/chart")
def get_chart_data(
    dataset_id: int,
    x_col: str = Query(..., description="The primary dimension for the X-axis"),
    chart_type: str = Query(..., description="The type of chart to render (bar, line, pie, scatter)"),
    y_col: str = Query(None, description="The secondary dimension for the Y-axis (optional for distribution charts)"),
    session: Session = Depends(get_session)
):
    """
    Functionality 4: Interactive Data Visualization.
    Acts as the Forensic Data Handshake, retrieving formatted arrays for dynamic Plotly charting.
    This endpoint ensures no 'black-box' math by passing raw parameters directly to the service logic.
    """
    try:
        # Pass the validated session and parameters to the visualization service
        return viz_service.get_chart_data(
            dataset_id=dataset_id, 
            x_col=x_col, 
            chart_type=chart_type, 
            y_col=y_col, 
            session=session
        )
    except Exception as e:
        # Forensic Error Mapping: Converts backend crashes into readable transparency logs
        raise HTTPException(
            status_code=500, 
            detail=f"Visualization Node Failure: {str(e)}"
        )