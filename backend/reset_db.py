from app.core.database import engine
from sqlmodel import SQLModel, text
# Import models to ensure they are registered with SQLModel.metadata
from app.models.dataset import Dataset
from app.models.user import User 

def reset_db():
    print("WARNING: Dropping all tables in AVIS_DB...")
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS dashboard"))
        conn.commit()
    
    SQLModel.metadata.drop_all(engine)
    print("Creating new tables with updated schema...")
    SQLModel.metadata.create_all(engine)
    print("Database Schema Updated successfully.")

if __name__ == "__main__":
    reset_db()