from sqlmodel import Session, select, create_engine
from app.models.dataset import Dataset
from app.core.database import sqlite_url
import json

engine = create_engine(sqlite_url)
with Session(engine) as session:
    datasets = session.exec(select(Dataset)).all()
    print(f"Total Datasets: {len(datasets)}")
    if datasets:
        d = datasets[0]
        # Simulate Pydantic .dict() or similar
        print(d.model_dump())
