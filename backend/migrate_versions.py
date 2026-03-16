import os
import urllib.parse
from sqlalchemy import create_engine, text

# Reuse the encoded logic configured in main
DB_USER = "root"
DB_PASSWORD = urllib.parse.quote_plus("Dashvanth@raj@0606")
DB_HOST = "localhost"
DB_NAME = "AVIS_DB"

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Initiating Database Architecture Upgrade")
    try:
        conn.execute(text("ALTER TABLE dataset ADD COLUMN version_number INTEGER NOT NULL DEFAULT 1;"))
        print(" -> Added version_number column")
    except Exception as e:
        print(f" -> version_number already exists or error: {e}")

    try:
        conn.execute(text("ALTER TABLE dataset ADD COLUMN parent_dataset_id INTEGER DEFAULT NULL;"))
        print(" -> Added parent_dataset_id column")
        # Ensure Foreign Key integrity map
        conn.execute(text("ALTER TABLE dataset ADD CONSTRAINT fk_parent_dataset FOREIGN KEY (parent_dataset_id) REFERENCES dataset(id);"))
        print(" -> Bound parent_dataset_id Foreign Key Constraint")
    except Exception as e:
        print(f" -> parent_dataset_id already exists or error: {e}")

    try:
        conn.execute(text("ALTER TABLE dataset ADD COLUMN repair_strategy VARCHAR(255) DEFAULT NULL;"))
        print(" -> Added repair_strategy column")
    except Exception as e:
        print(f" -> repair_strategy already exists or error: {e}")

    try:
        conn.execute(text("ALTER TABLE dataset ADD COLUMN repair_timestamp DATETIME DEFAULT NULL;"))
        print(" -> Added repair_timestamp column")
    except Exception as e:
        print(f" -> repair_timestamp already exists or error: {e}")

    # Explicit SQL Commit in SQLAlchemy 2.0+ pattern
    conn.commit()
    print("Version History Migration Finalized successfully.")
