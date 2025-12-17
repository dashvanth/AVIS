import os
import pandas as pd
from sqlmodel import Session, select, create_engine
from app.models.dataset import Dataset
from app.core.database import sqlite_url

# Reproduce the environment of the running server
# User runs uvicorn from .../backend/
# So CWD is .../backend/

print(f"Current Working Directory: {os.getcwd()}")

engine = create_engine(sqlite_url)
with Session(engine) as session:
    # Find train.csv
    statement = select(Dataset).where(Dataset.filename == "train.csv")
    results = session.exec(statement).all()
    
    print(f"Found {len(results)} datasets named 'train.csv'")
    
    for d in results:
        print(f"\n--- Checking Dataset ID: {d.id} ---")
        print(f"Stored Filepath: {d.filepath}")
        
        # Check Existence
        exists = os.path.exists(d.filepath)
        print(f"os.path.exists('{d.filepath}'): {exists}")
        
        if exists:
            # Try Reading
            try:
                df = pd.read_csv(d.filepath, nrows=5)
                print("Pandas Read Success!")
                print(df.columns.tolist())
            except Exception as e:
                print(f"Pandas Read Failed: {e}")
        else:
            # Try to find where it might be
            abs_path = os.path.abspath(d.filepath)
            print(f"Absolute path resolved to: {abs_path}")
            print("Listing 'uploads' dir to see what's actually there:")
            try:
                print(os.listdir('uploads'))
            except Exception as e:
                print(f"Could not list 'uploads': {e}")
