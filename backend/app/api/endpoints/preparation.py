
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session
from app.core.database import get_session
from app.services.preparation_service import get_preparation_suggestions, apply_preparation_strategies

router = APIRouter()

@router.get("/{dataset_id}/suggestions")
def get_suggestions(dataset_id: int, session: Session = Depends(get_session)):
    """
    Scans the dataset for issues and returns suggested fixes.
    Read-Only operation.
    """
    try:
        return get_preparation_suggestions(dataset_id, session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{dataset_id}/apply")
def apply_cleaning(
    dataset_id: int, 
    config: dict = Body(...), 
    session: Session = Depends(get_session)
):
    """
    Applies selected cleaning strategies and creates a NEW dataset version.
    Returns the new dataset ID.
    """
    try:
        return apply_preparation_strategies(dataset_id, config, session)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
