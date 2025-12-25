from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import json

class Dashboard(SQLModel, table=True):
    """
    Functionality 4: Persistence Node.
    Stores high-fidelity visualization snapshots linked to a verified dataset.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    dataset_id: int = Field(foreign_key="dataset.id", index=True)
    
    # Stores configuration as a JSON string to maintain schema flexibility
    layout_config: str 

    # Audit timestamps for version tracking
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def get_config(self) -> Dict[str, Any]:
        """Deserializes the stored layout configuration."""
        return json.loads(self.layout_config)