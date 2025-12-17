from fastapi import APIRouter, Depends
from sqlmodel import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.core.database import get_session
from app.services import chat_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    plot_config: Optional[Dict[str, Any]] = None

@router.post("/{dataset_id}", response_model=ChatResponse)
def chat_dataset(
    dataset_id: int, 
    request: ChatRequest, 
    session: Session = Depends(get_session)
):
    return chat_service.process_message(dataset_id, request.message, session)
