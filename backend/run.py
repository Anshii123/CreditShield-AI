import uvicorn
import os
import sys

# Add project root to python path to prevent import issues
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

if __name__ == "__main__":
    print("Starting CreditShield AI Backend Dev Server on http://localhost:8000")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
