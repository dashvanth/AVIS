# backend/app/api/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr
from app.core.database import get_session
from app.models.user import User
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

class UserCreate(BaseModel):
    name: str  # Directly matches frontend name field
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str

@router.post("/signup", response_model=Token)
def signup(user_in: UserCreate, session: Session = Depends(get_session)):
    # 1. Check for existing account
    statement = select(User).where(User.email == user_in.email)
    if session.exec(statement).first():
        raise HTTPException(status_code=400, detail="This email is already registered.")
    
    # 2. Create and commit new user
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    # 3. Handshake: Return token immediately for instant dashboard redirect
    access_token = create_access_token(data={"sub": new_user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_name": new_user.name
    }

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, session: Session = Depends(get_session)):
    # 1. Locate user in MySQL
    statement = select(User).where(User.email == user_in.email)
    user = session.exec(statement).first()
    
    # 2. Forensic credential check
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    
    # 3. Generate session token
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_name": user.name
    }