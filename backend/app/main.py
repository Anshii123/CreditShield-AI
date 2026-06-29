import sys
import os

# Add workspace root and backend root to python search paths
app_dir = os.path.dirname(os.path.abspath(__file__)) # .../backend/app/
backend_dir = os.path.dirname(app_dir) # .../backend/
workspace_root = os.path.dirname(backend_dir) # .../

for path in [workspace_root, backend_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Use absolute package imports relative to workspace root
from backend.app.core.config import PROJECT_NAME, VERSION, API_PREFIX, CORS_ORIGINS
from backend.app.api.endpoints import router as api_router

app = FastAPI(
    title=PROJECT_NAME,
    version=VERSION,
    description="Backend API for the CreditShield AI Loan Defaulter Prediction Platform"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints router twice: once at the root level (/) and once at the (/api) prefix
# This fulfills the direct route requirement (e.g. /predict, /model-performance)
# while maintaining full compatibility with the dashboard UI's (/api/...) requests.
app.include_router(api_router, prefix="")
app.include_router(api_router, prefix=API_PREFIX)

@app.get("/")
async def root():
    return {
        "message": f"Welcome to the {PROJECT_NAME}",
        "version": VERSION,
        "docs_url": "/docs",
        "status": "active"
    }
