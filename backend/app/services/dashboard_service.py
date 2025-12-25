from sqlmodel import Session, select
from app.models.dashboard import Dashboard
from app.models.dataset import Dataset
from fastapi import HTTPException, status
import json

def create_dashboard(dataset_id: int, name: str, config: dict, session: Session) -> Dashboard:
    """
    Creates a persistent visualization snapshot.
    Validates dataset existence before committing to the database.
    """
    # Verify the parent dataset exists
    dataset = session.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Parent dataset node missing."
        )

    dashboard = Dashboard(
        dataset_id=dataset_id,
        name=name,
        layout_config=json.dumps(config)
    )
    session.add(dashboard)
    session.commit()
    session.refresh(dashboard)
    return dashboard

def get_dashboards(dataset_id: int, session: Session):
    """Fetches all snapshots for a dataset, ordered by the most recent discovery."""
    statement = (
        select(Dashboard)
        .where(Dashboard.dataset_id == dataset_id)
        .order_by(Dashboard.created_at.desc())
    )
    return session.exec(statement).all()

def delete_dashboard(dashboard_id: int, session: Session) -> bool:
    """Removes a snapshot record from the database."""
    dashboard = session.get(Dashboard, dashboard_id)
    if dashboard:
        session.delete(dashboard)
        session.commit()
        return True
    return False