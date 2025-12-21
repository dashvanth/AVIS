from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import create_db_and_tables
# REMOVED: forecast from the import line below
from app.api.endpoints import datasets, eda, viz, dashboards, auth, insights, chat
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="A.V.I.S. - Analytical Visual Intelligence System",
    description="Backend API for AMAP (Automated Data Analysis Pipeline)",
    version="0.1.0",
    lifespan=lifespan
)

# Origins for CORS (Frontend URL)
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

app.include_router(datasets.router, prefix="/api/datasets", tags=["datasets"])
app.include_router(eda.router, prefix="/api/eda", tags=["eda"])
app.include_router(viz.router, prefix="/api/viz", tags=["viz"])
app.include_router(dashboards.router, prefix="/api/dashboards", tags=["dashboards"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
# REMOVED: app.include_router(forecast.router, ...) 
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to A.V.I.S. Backend API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}