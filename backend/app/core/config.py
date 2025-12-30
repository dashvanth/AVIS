# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY:str # Changed from GEMINI_API_KEY

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()