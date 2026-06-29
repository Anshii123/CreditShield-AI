# CreditShield AI 🛡️
### AI-Powered Loan Risk Assessment and Default Prediction Platform

CreditShield AI is a production-ready, full-stack enterprise risk intelligence platform designed to analyze, score, and predict the probability of loan defaults. Powered by a high-performance **FastAPI (Python)** backend and an elegant, responsive **React (Vite + Tailwind CSS + Framer Motion)** fintech dashboard, it automates credit evaluation using advanced machine learning models.

---

## 🛠️ Technology Stack

### Frontend
* **React.js (Vite)**: Component-based reactive user interface.
* **Tailwind CSS + PostCSS**: High-performance utility styling with a custom slate/indigo fintech dark mode.
* **Framer Motion**: Smooth, high-fidelity entry transitions and interactive card hover scaling.
* **Recharts**: Responsive SVG visualizations for metrics comparison and demographic distributions.
* **Axios**: Promised-based HTTP requests for smooth async integrations.

### Backend
* **FastAPI**: Modern, high-performance web framework for building REST APIs with auto-generated Swagger documentation.
* **Pydantic**: Robust data schema validations and strict datatype parsing.
* **Python-dotenv**: Configuration settings loaded from custom local environment files.

### Machine Learning
* **Scikit-Learn**: Implements preprocessing (`StandardScaler`, `OneHotEncoder`) and fits three separate classifiers:
  1. **Logistic Regression**
  2. **Random Forest Classifier**
  3. **Gradient Boosting Classifier**
* **Pandas & Numpy**: For high-performance data manipulation, data cleaning, and statistical summaries.
* **Pickle**: Standardized serialization of best-selected models and scaling/encoding states.

---

## 📁 System Architecture

```
CreditShield_AI/
├── dataset/
│   └── credit_risk_dataset.csv      # Customer credit record database
├── backend/
│   ├── ml/
│   │   ├── train_model.py           # Auto-training, comparison, and pickling CLI
│   │   ├── model.pkl                # Pickled classifier object (Logistic Regression/RF/GB)
│   │   ├── scaler.pkl               # Pickled StandardScaler object
│   │   ├── encoder.pkl              # Pickled OneHotEncoder object
│   │   └── metrics.json             # JSON file saving classifier metric comparison summaries
│   ├── app/
│   │   ├── main.py                  # API starter, CORS configuration, router registrations
│   │   ├── core/
│   │   │   └── config.py            # Settings manager, path normalizer, and .env parser
│   │   └── api/
│   │       └── endpoints.py         # REST routers for /predict and /model-performance
│   ├── requirements.txt             # Backend dependencies
│   ├── .env                         # Environment settings configurations
│   └── run.py                       # Dev server runner
├── frontend/
│   ├── src/
│   │   ├── components/              # View components (Home, Predictor, Analytics, Dataset)
│   │   ├── services/
│   │   │   └── api.js               # Centralized Axios service layer
│   │   ├── App.jsx                  # Main page coordinating layout transitions
│   │   ├── index.css                # Global styles, fonts, and scrollbars
│   │   └── main.jsx                 # Mount point bootstrapper
│   ├── tailwind.config.js           # Tailwind content mapping
│   ├── postcss.config.js            # PostCSS plugins (V4 adapter plugin)
│   ├── vite.config.js               # Dev server configuration and api proxy
│   └── package.json                 # Frontend dependencies (React, Recharts, Framer Motion, Axios)
└── README.md                        # Project documentation
```

---

## ⚡ Setup & Run Instructions

### 1. Install Backend Dependencies
Navigate to the `backend/` directory and install the required Python packages:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Model Training
Execute the automated training script. This script will automatically load the dataset, impute missing values, scale/encode attributes, train three models, evaluate performance (Accuracy, Precision, Recall, F1, ROC-AUC), pick the best algorithm, and save the pickles in `backend/ml/`:
```bash
python ml/train_model.py
```

### 3. Run FastAPI Backend
Launch the hot-reloading development server:
```bash
python run.py
```
The API is available at `http://localhost:8000`. You can test direct requests (e.g. `POST /predict`, `GET /model-performance`) or read Swagger docs at `http://localhost:8000/docs`.

### 4. Install Frontend Dependencies
Navigate to the `frontend/` directory and install the Node packages:
```bash
cd ../frontend
npm install
```

### 5. Run React Frontend
Start the local development server:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser to interact with the platform.

---

## 📋 Data Schema Requirements
The training database file `credit_risk_dataset.csv` must reside in the `dataset/` directory. Required columns:

* **Age**: Applicant age (e.g., 18 to 120 years).
* **Income**: Annual income in dollars.
* **Loan_Amount**: Requested loan amount in dollars.
* **Credit_Score**: FICO credit rating (300 to 850).
* **Employment_Years**: Years in current job (e.g., 0 to 60).
* **Education_Level**: Categorical parameter (`High School`, `Bachelor`, `Master`, `PhD`).
* **Housing_Status**: Residential status (`Rent`, `Mortgage`, `Own`).
* **Default**: Target label (`0` for clear, `1` for default historical record).
