from app.core.database import engine, create_db_and_tables
from sqlmodel import Session, text
# We import these models so the script knows which tables to create
from app.models.user import User
from app.models.dataset import Dataset
from app.models.dashboard import Dashboard

def reset_database():
    print("Connecting to MySQL to initialize AVIS_DB...")
    try:
        # 1. Create all the tables defined in our 'models' folder
        create_db_and_tables()
        
        # 2. Clear out any old data to start fresh
        with Session(engine) as session:
            print("Cleaning up old records...")
            # We turn off checks temporarily so we can delete tables that are linked
            session.exec(text("SET FOREIGN_KEY_CHECKS = 0;"))
            session.exec(text("TRUNCATE TABLE dashboard"))
            session.exec(text("TRUNCATE TABLE dataset"))
            session.exec(text("SET FOREIGN_KEY_CHECKS = 1;"))
            session.commit()
        print("✅ Success! Your MySQL database is ready.")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure MySQL is running and you created 'AVIS_DB' in Workbench.")

if __name__ == "__main__":
    reset_database()