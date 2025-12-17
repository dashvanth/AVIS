from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime

class Dashboard(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    dataset_id: int = Field(foreign_key="dataset.id")
    layout_config: str  # JSON string storing { x_col, y_col, chart_type }
    created_at: datetime = Field(default_factory=datetime.utcnow)
