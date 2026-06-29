import os
import sys
import json
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def train_and_select_model():
    print("=" * 60)
    print("CreditShield AI - ML Training Pipeline")
    print("=" * 60)
    
    # Establish paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    dataset_path = os.path.join(project_root, "..", "dataset", "credit_risk_dataset.csv")
    
    # Normalize paths
    dataset_path = os.path.abspath(dataset_path)
    ml_dir = current_dir # backend/ml/
    
    print(f"Dataset path: {dataset_path}")
    print(f"ML artifacts output directory: {ml_dir}")
    
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}. Please upload or supply your CSV file first.")
        
    # 1. Data Processing
    df = pd.read_csv(dataset_path)
    print(f"Loaded dataset successfully. Shape: {df.shape}")
    
    # Check columns
    required_cols = ["Age", "Income", "Loan_Amount", "Credit_Score", "Employment_Years", "Education_Level", "Housing_Status"]
    target_col = "Default"
    
    missing_required = [c for c in required_cols if c not in df.columns]
    if missing_required:
        raise ValueError(f"Dataset is missing required features: {missing_required}")
    
    if target_col not in df.columns:
        raise ValueError(f"Dataset target column '{target_col}' not found.")
        
    # Clean data (handle missing values)
    # Fill numerical columns with median
    numerical_cols = ["Age", "Income", "Loan_Amount", "Credit_Score", "Employment_Years"]
    for col in numerical_cols:
        if df[col].isnull().sum() > 0:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"  - Imputed missing values in '{col}' with median: {median_val}")
            
    # Fill categorical columns with mode
    categorical_cols = ["Education_Level", "Housing_Status"]
    for col in categorical_cols:
        if df[col].isnull().sum() > 0:
            mode_val = df[col].mode()[0]
            df[col] = df[col].fillna(mode_val)
            print(f"  - Imputed missing values in '{col}' with mode: {mode_val}")

    # Prepare features and target
    X = df[required_cols].copy()
    y = df[target_col].copy()
    
    # Train/Test Split
    test_size = 0.2 if len(df) >= 10 else 1
    if len(df) >= 5:
        stratify_y = y if len(df) >= 10 and len(np.unique(y)) > 1 else None
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=stratify_y
        )
    else:
        X_train, X_test, y_train, y_test = X, X, y, y
        
    print(f"Train subset size: {X_train.shape[0]}, Test subset size: {X_test.shape[0]}")
    
    # 2. Feature Engineering / Preprocessing
    X_train_num = X_train[numerical_cols]
    X_train_cat = X_train[categorical_cols]
    
    X_test_num = X_test[numerical_cols]
    X_test_cat = X_test[categorical_cols]
    
    # Fit & save StandardScaler
    scaler = StandardScaler()
    X_train_num_scaled = scaler.fit_transform(X_train_num)
    X_test_num_scaled = scaler.transform(X_test_num)
    
    # Fit & save OneHotEncoder
    try:
        encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
        X_train_cat_encoded = encoder.fit_transform(X_train_cat)
    except TypeError:
        encoder = OneHotEncoder(handle_unknown='ignore', sparse=False)
        X_train_cat_encoded = encoder.fit_transform(X_train_cat)
        
    X_test_cat_encoded = encoder.transform(X_test_cat)
    
    # Combine processed features
    X_train_processed = np.hstack([X_train_num_scaled, X_train_cat_encoded])
    X_test_processed = np.hstack([X_test_num_scaled, X_test_cat_encoded])
    
    cat_features = list(encoder.get_feature_names_out(categorical_cols))
    all_features = numerical_cols + cat_features
    
    # 3. Train multiple models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(random_state=42)
    }
    
    comparison = {}
    best_model_name = None
    best_f1 = -1.0
    best_model_obj = None
    
    print("\nComparing classifier performances on test set:")
    for name, model in models.items():
        model.fit(X_train_processed, y_train)
        y_pred = model.predict(X_test_processed)
        y_prob = model.predict_proba(X_test_processed)[:, 1] if hasattr(model, "predict_proba") else y_pred
        
        acc = float(accuracy_score(y_test, y_pred))
        try:
            prec = float(precision_score(y_test, y_pred, zero_division=0))
            rec = float(recall_score(y_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, zero_division=0))
        except Exception:
            prec, rec, f1 = 0.0, 0.0, 0.0
            
        try:
            roc_auc = float(roc_auc_score(y_test, y_prob)) if len(np.unique(y_test)) > 1 else 0.5
        except Exception:
            roc_auc = 0.5
            
        comparison[name] = {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "roc_auc": roc_auc
        }
        
        print(f"  - {name}: F1={f1:.4f}, Accuracy={acc:.4f}, ROC-AUC={roc_auc:.4f}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = model
            
    if best_f1 == 0.0:
        best_acc = -1.0
        for name, metrics in comparison.items():
            if metrics["accuracy"] > best_acc:
                best_acc = metrics["accuracy"]
                best_model_name = name
                best_model_obj = models[name]
                
    print(f"\n---> Selected Best Model: {best_model_name}")
    
    # Save the pickle files inside backend/ml/
    os.makedirs(ml_dir, exist_ok=True)
    
    model_pickle_path = os.path.join(ml_dir, "model.pkl")
    scaler_pickle_path = os.path.join(ml_dir, "scaler.pkl")
    encoder_pickle_path = os.path.join(ml_dir, "encoder.pkl")
    metrics_json_path = os.path.join(ml_dir, "metrics.json")
    
    with open(model_pickle_path, "wb") as f:
        pickle.dump(best_model_obj, f)
        
    with open(scaler_pickle_path, "wb") as f:
        pickle.dump(scaler, f)
        
    with open(encoder_pickle_path, "wb") as f:
        pickle.dump(encoder, f)
        
    feature_importances = []
    if hasattr(best_model_obj, "feature_importances_"):
        importances = best_model_obj.feature_importances_
        for feat, imp in zip(all_features, importances):
            feature_importances.append({"feature": feat, "importance": float(imp)})
    elif hasattr(best_model_obj, "coef_"):
        coefs = np.abs(best_model_obj.coef_[0])
        total_coef = np.sum(coefs) if np.sum(coefs) > 0 else 1.0
        importances = coefs / total_coef
        for feat, imp in zip(all_features, importances):
            feature_importances.append({"feature": feat, "importance": float(imp)})
    else:
        for feat in all_features:
            feature_importances.append({"feature": feat, "importance": 1.0 / len(all_features)})
            
    feature_importances = sorted(feature_importances, key=lambda x: x["importance"], reverse=True)
    
    best_metrics = comparison[best_model_name]
    metrics_summary = {
        "status": "trained",
        "selected_model": best_model_name,
        "sample_count": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "accuracy": best_metrics["accuracy"],
        "precision": best_metrics["precision"],
        "recall": best_metrics["recall"],
        "f1_score": best_metrics["f1_score"],
        "roc_auc": best_metrics["roc_auc"],
        "feature_importances": feature_importances,
        "model_comparison": comparison
    }
    
    with open(metrics_json_path, "w") as f:
        json.dump(metrics_summary, f, indent=4)
        
    print(f"Pickled components successfully written to {ml_dir} directory.")
    print("=" * 60)
    return metrics_summary

if __name__ == "__main__":
    train_and_select_model()
