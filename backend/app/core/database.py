from sqlmodel import SQLModel, create_engine, Session
import urllib.parse

# --- DATABASE CONFIGURATION ---
import os

# --- DATABASE CONFIGURATION ---
DB_USER = "root"
# This is where your password 'Dashvanth@raj@0606' caused the issue. 
# We will "quote" it to make it safe for the URL.
DB_PASSWORD = urllib.parse.quote_plus("Dashvanth@raj@0606") 
DB_HOST = "localhost"
DB_NAME = "AVIS_DB"

# Priority: Environment Variable (Render/Prod) > Local Config (Dev)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # The Connection URL now uses the safely encoded password
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Create the Engine
# echo=True is good for dev, maybe noisy for prod but acceptable
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """Initializes the database and creates tables based on our Models"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Provides a database connection for each API request"""
    with Session(engine) as session:
        yield session