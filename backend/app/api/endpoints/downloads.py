
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from app.core.database import get_session
from app.services import download_service

router = APIRouter()

@router.get("/{dataset_id}/data")
def download_data(
    dataset_id: int, 
    version: str = Query("prepared", enum=["original", "prepared"]), 
    session: Session = Depends(get_session)
):
    """
    Download the dataset in CSV format.
    """
    return download_service.generate_csv_export(dataset_id, version, session)

@router.get("/{dataset_id}/zip")
def download_bundle(dataset_id: int, session: Session = Depends(get_session)):
    """
    Download everything (Data + Report + Insights) as a ZIP.
    """
    return download_service.generate_full_zip(dataset_id, session)
