import os
import sys

# Add project root to python path to prevent import issues
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.app.ml.model import train_model

def main():
    print("=" * 50)
    print("CreditShield AI - Offline Model Training CLI")
    print("=" * 50)
    
    try:
        metrics = train_model()
        print("\nModel trained successfully!")
        print(f"Dataset Row Count: {metrics['sample_count']}")
        print(f"Training Subset:  {metrics['train_size']}")
        print(f"Testing Subset:   {metrics['test_size']}")
        print(f"Accuracy:         {metrics['accuracy']:.4f}")
        print(f"Precision:        {metrics['precision']:.4f}")
        print(f"Recall:           {metrics['recall']:.4f}")
        print(f"F1 Score:         {metrics['f1_score']:.4f}")
        print(f"ROC AUC:          {metrics['roc_auc']:.4f}")
        print("\nTop Features by Importance:")
        for idx, item in enumerate(metrics['feature_importances'][:5]):
            print(f"  {idx+1}. {item['feature']}: {item['importance']:.4f}")
        print("=" * 50)
    except FileNotFoundError as e:
        print(f"\n[ERROR] Dataset file missing: {e}")
        sys.exit(1)
    except ValueError as e:
        print(f"\n[ERROR] Dataset error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error during training: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
