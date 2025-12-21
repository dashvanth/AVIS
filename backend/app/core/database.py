from sqlmodel import SQLModel, create_engine, Session

# --- DATABASE CONFIGURATION ---
# Replace 'your_username' and 'your_password' with your actual MySQL credentials
DB_USER = "root"
DB_PASSWORD = "Dashvanth@raj@0606" 
DB_HOST = "localhost"
DB_NAME = "AVIS_DB"

# The Connection URL using the pymysql driver
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Create the Engine
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """Initializes the database and creates tables based on our Models"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Provides a database connection for each API request"""
    with Session(engine) as session:
        yield session