from sqlmodel import Session, create_engine, text
from app.core.database import sqlite_url

engine = create_engine(sqlite_url)
with Session(engine) as session:
    # Truncate dataset table to clear stale records
    print("Clearing all datasets from DB...")
    session.exec(text("DELETE FROM dataset"))
    session.commit()
    print("Database cleared.")
