from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import create_db_and_tables
from app.api.endpoints import datasets, eda, viz, dashboards, auth, insights, chat
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles the startup and shutdown logic. 
    Ensures MySQL tables are initialized before the handshake.
    """
    create_db_and_tables()
    yield

app = FastAPI(
    title="A.V.I.S. - Analytical Visual Intelligence System",
    description="Backend API for AMAP (Automated Data Analysis Pipeline)",
    version="0.1.0",
    lifespan=lifespan
)

# Origins for CORS: Ensures Vite and local dev environments can connect
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Functionality 1 & 2: Dataset Ingestion & Processing Logic
app.include_router(datasets.router, prefix="/api/datasets", tags=["datasets"])

# Functionality 3: Guided Exploratory Data Analysis (EDA)
app.include_router(eda.router, prefix="/api/eda", tags=["eda"])

# Functionality 4: Interactive Visualization Engine
app.include_router(viz.router, prefix="/api/viz", tags=["viz"])

# Dashboard Management & Persistence
app.include_router(dashboards.router, prefix="/api/dashboards", tags=["dashboards"])

# Functionality 7: Secure User Management & Auth
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Functionality 5 & 6: Context-Aware Insights & AI Chat
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to A.V.I.S. Backend API"}

@app.get("/health")
def health_check():
    """System heartbeat for diagnostic audits."""
    return {"status": "healthy"}