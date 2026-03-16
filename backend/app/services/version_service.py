from fastapi import HTTPException
from sqlmodel import Session, select
from app.models.dataset import Dataset

def get_version_history(dataset_id: int, session: Session) -> list:
    """Traverses backward through parent_dataset_id links to map logical history."""
    history = []
    
    current_dataset = session.get(Dataset, dataset_id)
    if not current_dataset:
         raise HTTPException(status_code=404, detail="Requested dataset not found for history traversal.")
         
    # Trace backwards until root (parent_dataset_id == None)
    cursor = current_dataset
    while cursor:
        desc = "Original Upload" if cursor.parent_dataset_id is None else f"{cursor.repair_strategy}"
        history.append({
             "id": cursor.id,
             "version": cursor.version_number,
             "description": desc,
             "timestamp": cursor.repair_timestamp.strftime("%Y-%m-%d %H:%M") if cursor.repair_timestamp else cursor.created_at.strftime("%Y-%m-%d %H:%M"),
             "filename": cursor.filename
        })
        
        if cursor.parent_dataset_id:
             cursor = session.get(Dataset, cursor.parent_dataset_id)
        else:
             cursor = None
             
    # Reverse to return Root -> Children ordering
    history.reverse()
    return history

def restore_version(dataset_id: int, session: Session) -> dict:
     """Validates dataset state prior to rendering backward jumps."""
     target = session.get(Dataset, dataset_id)
     if not target:
          raise HTTPException(status_code=404, detail="Target dataset bound not found for restoration.")
          
     # We don't overwrite rows in DB, we strictly redirect the frontend to load this ID.
     # This explicitly preserves "Undo" logic without permanently destroying sibling timelines.
     return {
          "status": "success",
          "message": f"Verified bounds for Dataset V{target.version_number}",
          "restored_dataset_id": target.id,
     }
