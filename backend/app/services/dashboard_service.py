from sqlmodel import Session, select
from app.models.dashboard import Dashboard
import json

def create_dashboard(dataset_id: int, name: str, config: dict, session: Session) -> Dashboard:
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
    statement = select(Dashboard).where(Dashboard.dataset_id == dataset_id).order_by(Dashboard.created_at.desc())
    return session.exec(statement).all()

def delete_dashboard(dashboard_id: int, session: Session):
    dashboard = session.get(Dashboard, dashboard_id)
    if dashboard:
        session.delete(dashboard)
        session.commit()
        return True
    return False
