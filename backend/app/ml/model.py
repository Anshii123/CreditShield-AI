import os
import json
import pickle
import pandas as pd
import numpy as np

# Feature definitions
NUMERICAL_COLS = ["Age", "Income", "Loan_Amount", "Credit_Score", "Employment_Years"]
CATEGORICAL_COLS = ["Education_Level", "Housing_Status"]

# Global caches for ML pickled artifacts
_cached_model = None
_cached_scaler = None
_cached_encoder = None
_cached_metrics = None

def get_ml_paths():
    """Returns absolute paths to backend/ml/ pickled files."""
    current_dir = os.path.dirname(os.path.abspath(__file__)) # backend/app/ml/
    backend_dir = os.path.dirname(current_dir) # backend/app/
    project_root = os.path.dirname(backend_dir) # backend/
    
    ml_dir = os.path.join(project_root, "ml")
    return {
        "model": os.path.join(ml_dir, "model.pkl"),
        "scaler": os.path.join(ml_dir, "scaler.pkl"),
        "encoder": os.path.join(ml_dir, "encoder.pkl"),
        "metrics": os.path.join(ml_dir, "metrics.json"),
        "dataset": os.path.join(project_root, "..", "dataset", "credit_risk_dataset.csv")
    }

def load_ml_artifacts():
    """Loads and caches the model, scaler, encoder and metrics from pickles."""
    global _cached_model, _cached_scaler, _cached_encoder, _cached_metrics
    
    paths = get_ml_paths()
    
    # Check if files exist
    if not (os.path.exists(paths["model"]) and os.path.exists(paths["scaler"]) and os.path.exists(paths["encoder"])):
        return False
        
    try:
        if _cached_model is None:
            with open(paths["model"], "rb") as f:
                _cached_model = pickle.load(f)
                
        if _cached_scaler is None:
            with open(paths["scaler"], "rb") as f:
                _cached_scaler = pickle.load(f)
                
        if _cached_encoder is None:
            with open(paths["encoder"], "rb") as f:
                _cached_encoder = pickle.load(f)
                
        if _cached_metrics is None and os.path.exists(paths["metrics"]):
            with open(paths["metrics"], "r") as f:
                _cached_metrics = json.load(f)
                
        return True
    except Exception as e:
        print(f"Error loading ML pickling artifacts: {e}")
        return False

def clear_ml_artifacts_cache():
    """Clears global cached files to force reloading on retraining."""
    global _cached_model, _cached_scaler, _cached_encoder, _cached_metrics
    _cached_model = None
    _cached_scaler = None
    _cached_encoder = None
    _cached_metrics = None

def get_performance_metrics():
    """Returns evaluation metrics of the active model."""
    load_ml_artifacts()
    return _cached_metrics

def predict_single_applicant(data_dict):
    """Predicts loan default using standard pickled components."""
    if not load_ml_artifacts():
        raise RuntimeError("ML model has not been trained yet. Please run training first.")
        
    # Convert inputs to DataFrame
    df = pd.DataFrame([data_dict])
    
    # Preprocess inputs
    X_num = df[NUMERICAL_COLS]
    X_cat = df[CATEGORICAL_COLS]
    
    # Transform features
    X_num_scaled = _cached_scaler.transform(X_num)
    X_cat_encoded = _cached_encoder.transform(X_cat)
    
    # Combine processed features
    X_processed = np.hstack([X_num_scaled, X_cat_encoded])
    
    # Score predictions
    prob = float(_cached_model.predict_proba(X_processed)[0, 1])
    pred = int(_cached_model.predict(X_processed)[0])
    
    # Determine risk level
    if prob < 0.3:
        risk_level = "Low"
    elif prob < 0.6:
        risk_level = "Medium"
    else:
        risk_level = "High"
        
    # Translate binary class (Default: 1 = Delinquent, 0 = Clear)
    # prediction value of 0 means Approved, 1 means Rejected
    prediction_label = "Rejected" if pred == 1 else "Approved"
    
    # Explanatory factors
    explanations = []
    if data_dict["Credit_Score"] < 600:
        explanations.append("Credit score is low (< 600), representing a significant credit risk.")
    elif data_dict["Credit_Score"] > 750:
        explanations.append("High credit score (> 750) reduces credit risk.")
        
    debt_to_income = data_dict["Loan_Amount"] / max(data_dict["Income"], 1)
    if debt_to_income > 0.4:
        explanations.append(f"High loan-to-income ratio ({debt_to_income:.1%}) increases repayment burden.")
    elif debt_to_income < 0.15:
        explanations.append(f"Low loan-to-income ratio ({debt_to_income:.1%}) suggests strong repayment capacity.")
        
    if data_dict["Employment_Years"] < 2:
        explanations.append("Short employment history (< 2 years) may indicate income instability.")
    elif data_dict["Employment_Years"] > 8:
        explanations.append("Long employment history suggests highly stable career and income flow.")
        
    if data_dict["Housing_Status"] == "Rent":
        explanations.append("Housing status 'Rent' correlates with slightly elevated risk profiles.")
    elif data_dict["Housing_Status"] == "Own":
        explanations.append("Owning a home is a positive factor that lowers loan delinquency risk.")
        
    if not explanations:
        explanations.append("Overall client factors align with average loan repayment patterns.")
        
    # Get accuracy metric
    accuracy_val = _cached_metrics.get("accuracy", 0.0) if _cached_metrics else 0.0
    
    return {
        "prediction": prediction_label,
        "default_probability": prob,
        "probability": prob, # For UI compatibility
        "accuracy": accuracy_val,
        "risk_level": risk_level,
        "explanations": explanations
    }
