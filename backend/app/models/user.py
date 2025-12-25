from typing import Optional
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    """
    Persistent relational model for A.V.I.S. authenticated entities.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # User identification for dashboard personalization
    name: str = Field(description="User's full name")
    
    # Email is unique to prevent duplicate accounts
    email: str = Field(unique=True, index=True, nullable=False)
    
    # Securely stored hashed password
    hashed_password: str = Field(nullable=False)