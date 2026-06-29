import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve root paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

# Load environment configurations
if os.path.exists(ENV_PATH):
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()

# Dataset and Models paths
DATASET_RAW = os.getenv("DATASET_PATH", "../dataset/credit_risk_dataset.csv")

# Resolve relative paths relative to backend directory
if not os.path.isabs(DATASET_RAW):
    DATASET_PATH = (BASE_DIR / DATASET_RAW).resolve()
else:
    DATASET_PATH = Path(DATASET_RAW).resolve()

MODEL_DIR = BASE_DIR / "ml"
MODEL_FILE = MODEL_DIR / "model.pkl"
SCALER_FILE = MODEL_DIR / "scaler.pkl"
ENCODER_FILE = MODEL_DIR / "encoder.pkl"
METRICS_FILE = MODEL_DIR / "metrics.json"

# Ensure directories exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATASET_PATH.parent, exist_ok=True)

# API Settings
PROJECT_NAME = os.getenv("PROJECT_NAME", "CreditShield AI API")
VERSION = os.getenv("VERSION", "1.2.0")
API_PREFIX = "/api"

# CORS Setup
origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,*")
CORS_ORIGINS = [org.strip() for org in origins_raw.split(",") if org.strip()]
