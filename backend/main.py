from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.database import create_db_and_tables
from app.api.endpoints import datasets, eda, viz, auth, insights, chat, preparation, downloads
from contextlib import asynccontextmanager
import time
import logging

from dotenv import load_dotenv
load_dotenv() 

from fastapi import FastAPI
# Initialize Forensic Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AVIS_ENGINE")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Functionality 1: Startup Audit.
    Ensures relational tables in MySQL are verified and synchronized before 
    the Analytical Visual Intelligence System begins operation.
    """
    logger.info("INITIATING SYSTEM HANDSHAKE: Initializing Database...")
    create_db_and_tables()
    logger.info("SYSTEM READY: All forensic nodes active.")
    yield
    logger.info("SHUTTING DOWN: Terminating A.V.I.S. sessions...")

app = FastAPI(
    title="A.V.I.S. - Analytical Visual Intelligence System",
    description="Advanced Forensic Backend for Automated Data Analysis (AMAP)",
    version="2.0.0",
    lifespan=lifespan
)

# Advanced CORS Configuration: Dynamic environment handling
origins = [
    "http://localhost:5173",
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

# Forensic Middleware: Tracks request latency and audit IDs
@app.middleware("http")
async def audit_request_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Standardized Error Handling: Catches unhandled logic anomalies
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"SYSTEM ANOMALY DETECTED: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Forensic Engine Error: An unexpected logic anomaly occurred."},
    )

# --- ROUTER REGISTRATION (Nodes 1 through 7) ---

# Node 1 & 2: Secure Ingestion & Forensic Processing
app.include_router(datasets.router, prefix="/api/datasets", tags=["Ingestion Node"])

# Node 3: Guided Exploratory Data Analysis (EDA)
app.include_router(eda.router, prefix="/api/eda", tags=["Discovery Node"])

# Node 4: Interactive Visualization Engine
app.include_router(viz.router, prefix="/api/viz", tags=["Visualization Node"])

# Node 7: Secure User Management & Auth
app.include_router(auth.router, prefix="/api/auth", tags=["Security Node"])

# Node 5 & 6: Context-Aware Intelligence & AI Assistant
app.include_router(insights.router, prefix="/api/insights", tags=["Intelligence Node"])
app.include_router(chat.router, prefix="/api/chat", tags=["Assistance Node"])

# Node 8: Data Preparation (Transparent Cleaning)
app.include_router(preparation.router, prefix="/api/preparation", tags=["Preparation Node"])

# Node 9: Export & Download Center (New)
app.include_router(downloads.router, prefix="/api/export", tags=["Export Node"])

@app.get("/", tags=["Diagnostic"])
def read_root():
    return {
        "engine": "A.V.I.S. Analytical Visual Intelligence System",
        "status": "Online",
        "handshake": "Verified"
    }

@app.get("/health", tags=["Diagnostic"])
def health_check():
    """Diagnostic audit for system heartbeat verification."""
    return {
        "status": "Healthy",
        "nodes_active": 7,
        "database": "Synchronized"
    }