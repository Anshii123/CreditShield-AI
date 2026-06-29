import sys
import os

# Add workspace root and backend root to python search paths
app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # .../backend/app/
backend_dir = os.path.dirname(app_dir) # .../backend/
workspace_root = os.path.dirname(backend_dir) # .../

for path in [workspace_root, backend_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

import shutil
import pandas as pd
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel, Field

from backend.app.core.config import DATASET_PATH
from backend.app.ml.model import (
    predict_single_applicant, 
    get_performance_metrics,
    clear_ml_artifacts_cache,
    get_ml_paths
)
from backend.ml.train_model import train_and_select_model

router = APIRouter()

# Prediction Input Schema
class LoanApplication(BaseModel):
    Age: int = Field(..., ge=18, le=120, description="Age of the applicant (18-120)", example=30)
    Income: float = Field(..., gt=0, le=100000000, description="Annual income of the applicant (>0)", example=65000.0)
    Loan_Amount: float = Field(..., gt=0, le=10000000, description="Requested loan amount (>0)", example=15000.0)
    Credit_Score: int = Field(..., ge=300, le=850, description="Credit score of the applicant (300-850)", example=710)
    Employment_Years: int = Field(..., ge=0, le=60, description="Years in current employment (0-60)", example=5)
    Education_Level: str = Field(..., pattern="^(High School|Bachelor|Master|PhD)$", description="Education level: High School, Bachelor, Master, PhD", example="Bachelor")
    Housing_Status: str = Field(..., pattern="^(Rent|Mortgage|Own)$", description="Housing status: Rent, Mortgage, Own", example="Mortgage")

    class Config:
        json_schema_extra = {
            "example": {
                "Age": 30,
                "Income": 65000.0,
                "Loan_Amount": 15000.0,
                "Credit_Score": 710,
                "Employment_Years": 5,
                "Education_Level": "Bachelor",
                "Housing_Status": "Mortgage"
            }
        }

@router.get("/model-performance")
async def get_performance():
    """Returns exact model accuracy metrics."""
    metrics = get_performance_metrics()
    if metrics is None:
        raise HTTPException(
            status_code=404, 
            detail="Model is not trained. Please run training first."
        )
    return {
        "accuracy": metrics.get("accuracy"),
        "precision": metrics.get("precision"),
        "recall": metrics.get("recall"),
        "f1_score": metrics.get("f1_score"),
        "roc_auc": metrics.get("roc_auc")
    }

@router.post("/predict")
async def predict(application: LoanApplication):
    """Predicts default risk for an applicant and returns decision details."""
    paths = get_ml_paths()
    if not (os.path.exists(paths["model"]) and os.path.exists(paths["scaler"])):
        # Auto-train model if dataset is present
        if os.path.exists(DATASET_PATH):
            try:
                print("Model artifacts not found, auto-training...")
                train_and_select_model()
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to auto-train model: {str(e)}")
        else:
            raise HTTPException(
                status_code=400, 
                detail="Model is not trained and dataset file was not found. Please upload dataset first."
            )
            
    try:
        result = predict_single_applicant(application.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# --- Compatibility Endpoints for Dashboard UI ---

@router.get("/model/status")
async def get_model_status():
    """Maps custom dashboard indicators to pickling artifacts status."""
    metrics = get_performance_metrics()
    if metrics is not None:
        return {
            "trained": True,
            "metrics": metrics
        }
    return {
        "trained": False,
        "message": "Model has not been trained yet. Please train the model."
    }

@router.post("/train")
async def trigger_training():
    """Retrains models and auto-saves pickles."""
    try:
        metrics = train_and_select_model()
        clear_ml_artifacts_cache()
        return {
            "success": True,
            "message": "Model trained successfully.",
            "metrics": metrics
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.post("/dataset/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Uploads and overwrites the CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
        
    try:
        os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)
        with open(DATASET_PATH, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        clear_ml_artifacts_cache()
        
        df = pd.read_csv(DATASET_PATH)
        required_cols = ["Age", "Income", "Loan_Amount", "Credit_Score", "Employment_Years", "Education_Level", "Housing_Status"]
        missing = [col for col in required_cols if col not in df.columns]
        has_target = "Default" in df.columns
        
        return {
            "success": True,
            "filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns),
            "missing_required_features": missing,
            "has_target_column": has_target,
            "message": "Dataset uploaded successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process uploaded file: {str(e)}")

@router.get("/dataset/preview")
async def get_dataset_preview():
    """Returns preview of uploaded dataset."""
    if not os.path.exists(DATASET_PATH):
        return {"exists": False, "message": "No dataset found."}
        
    try:
        df = pd.read_csv(DATASET_PATH)
        df_cleaned = df.fillna("")
        preview_data = df_cleaned.head(15).to_dict(orient="records")
        return {
            "exists": True,
            "total_rows": len(df),
            "columns": list(df.columns),
            "data": preview_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read dataset: {str(e)}")

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Aggregates demographic and risk analytics for visuals."""
    if not os.path.exists(DATASET_PATH):
        return {
            "dataset_exists": False,
            "total_applications": 0,
            "defaulter_rate": 0.0,
            "average_credit_score": 0.0,
            "average_income": 0.0
        }
        
    try:
        df = pd.read_csv(DATASET_PATH)
        total_rows = len(df)
        
        if total_rows == 0:
            return {
                "dataset_exists": True,
                "total_applications": 0,
                "defaulter_rate": 0.0,
                "average_credit_score": 0.0,
                "average_income": 0.0
            }
            
        defaulter_count = int(df["Default"].sum()) if "Default" in df.columns else 0
        defaulter_rate = float(defaulter_count / total_rows) if "Default" in df.columns else 0.0
        
        avg_credit_score = float(df["Credit_Score"].mean()) if "Credit_Score" in df.columns else 0.0
        avg_income = float(df["Income"].mean()) if "Income" in df.columns else 0.0
        avg_loan = float(df["Loan_Amount"].mean()) if "Loan_Amount" in df.columns else 0.0
        
        housing_stats = []
        if "Housing_Status" in df.columns and "Default" in df.columns:
            group = df.groupby("Housing_Status")["Default"].agg(["count", "sum", "mean"]).reset_index()
            for _, row in group.iterrows():
                housing_stats.append({
                    "status": row["Housing_Status"],
                    "total": int(row["count"]),
                    "defaulters": int(row["sum"]),
                    "rate": float(row["mean"])
                })
                
        edu_stats = []
        if "Education_Level" in df.columns and "Income" in df.columns:
            group = df.groupby("Education_Level")["Income"].mean().reset_index()
            for _, row in group.iterrows():
                edu_stats.append({
                    "level": row["Education_Level"],
                    "avg_income": float(row["Income"])
                })
                
        credit_bands = [
            {"name": "Poor (300-579)", "value": int(((df["Credit_Score"] >= 300) & (df["Credit_Score"] < 580)).sum())},
            {"name": "Fair (580-669)", "value": int(((df["Credit_Score"] >= 580) & (df["Credit_Score"] < 670)).sum())},
            {"name": "Good (670-739)", "value": int(((df["Credit_Score"] >= 670) & (df["Credit_Score"] < 740)).sum())},
            {"name": "Very Good (740-799)", "value": int(((df["Credit_Score"] >= 740) & (df["Credit_Score"] < 800)).sum())},
            {"name": "Exceptional (800-850)", "value": int(((df["Credit_Score"] >= 800) & (df["Credit_Score"] <= 850)).sum())}
        ]
        
        debt_ratios = []
        if "Loan_Amount" in df.columns and "Income" in df.columns and "Default" in df.columns:
            temp_df = df.copy()
            temp_df["dti"] = temp_df["Loan_Amount"] / temp_df["Income"]
            
            def categorize_dti(val):
                if val < 0.15: return "Low (<15%)"
                elif val < 0.30: return "Moderate (15-30%)"
                elif val < 0.45: return "High (30-45%)"
                else: return "Critical (>45%)"
                
            temp_df["dti_band"] = temp_df["dti"].apply(categorize_dti)
            group = temp_df.groupby("dti_band")["Default"].agg(["count", "mean"]).reset_index()
            bands_order = {"Low (<15%)": 1, "Moderate (15-30%)": 2, "High (30-45%)": 3, "Critical (>45%)": 4}
            group["order"] = group["dti_band"].map(bands_order)
            group = group.sort_values("order")
            for _, row in group.iterrows():
                debt_ratios.append({
                    "band": row["dti_band"],
                    "total": int(row["count"]),
                    "rate": float(row["mean"])
                })

        return {
            "dataset_exists": True,
            "total_applications": total_rows,
            "defaulter_rate": defaulter_rate,
            "defaulter_count": defaulter_count,
            "average_credit_score": avg_credit_score,
            "average_income": avg_income,
            "average_loan_amount": avg_loan,
            "housing_stats": housing_stats,
            "education_stats": edu_stats,
            "credit_bands": credit_bands,
            "debt_ratios": debt_ratios
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard statistics: {str(e)}")
