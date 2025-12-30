from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, Text

class Dataset(SQLModel, table=True):
    """
    Functionality 1, 2, & 7: The Core Relational Entity.
    Stores persistent metadata for audited assets including deep structural logs.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # --- Physical Asset Metadata ---
    filename: str = Field(index=True)
    filepath: str
    file_type: str = Field(index=True) # csv, xlsx, json, xml
    file_size_bytes: int
    
    # --- Structural Intelligence (Functionality 1 & 2) ---
    row_count: int
    column_count: int
    
    # Advanced Transparency: Store precisely how many null gaps were handled
    unstructured_null_count: int = Field(default=0)
    unstructured_row_removal_count: int = Field(default=0)
    
    # Dataset Characterization (AI Orientation Result)
    # e.g., "High-Dimensional Sales Matrix" or "Categorical Survey Asset"
    characterization: Optional[str] = Field(default="Relational Asset")
    
    # Overall structural health score (0-100)
    quality_score: Optional[float] = Field(default=0.0)
    
    # RADICAL TRANSPARENCY LOG (Functionality 2) - Stored as TEXT (MySQL)
    processing_log: Optional[str] = Field(default="[]", sa_column=Column(Text), description="JSON string of audit log")
    forensic_trace: Optional[str] = Field(default="[]", sa_column=Column(Text), description="JSON string of forensic trace")
    ingestion_insights: Optional[str] = Field(default="[]", sa_column=Column(Text), description="JSON string of AI insights")
    
    # --- State Management ---
    analyzed: bool = Field(default=False)
    
    # --- Ownership & Security (Functionality 7) ---
    # Tracks which node/user initialized the ingestion handshake
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    
    # --- Temporal Metadata ---
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    # --- Methods for Advanced Orientation ---
    def get_summary_text(self) -> str:
        """Returns a characterization summary for the frontend UI."""
        return f"{self.characterization}: {self.row_count} instances across {self.column_count} dimensions."