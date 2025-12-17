from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel

class Dataset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    filepath: str
    file_type: str
    row_count: int
    column_count: int
    file_size_bytes: int
    analyzed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
