import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import json
import os
import datetime

# Ensure the script runs relative to the project root
csv_path = "ml/traffic_data.csv"
model_path = "ml/model.pkl"

if not os.path.exists(csv_path):
    print(f"Error: {csv_path} not found. Run generate_data.py first.")
    exit(1)

# Load dataset
df = pd.read_csv(csv_path)

# Features — now includes event_intensity from live PredictHQ pipeline
X = df[[
    "speed",
    "vehicle_count",
    "weather",
    "incident_score",
    "eta",
    "hour",
    "is_peak",
    "event_intensity",
    "google_traffic_factor"
]]

# Target
y = df["congestion"]  # 0: Low, 1: Medium, 2: High

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Model initialization
model = RandomForestClassifier(n_estimators=100, random_state=42)

# Training loop
print("🧠 Training Random Forest Classifier...")
model.fit(X_train, y_train)

# Evaluation
accuracy = model.score(X_test, y_test)
print(f"✅ Training Complete. Model Accuracy: {accuracy*100:.2f}%")

y_pred = model.predict(X_test)
report = classification_report(y_test, y_pred, target_names=["LOW", "MEDIUM", "HIGH"], output_dict=True)
feature_importances = dict(zip(X.columns, model.feature_importances_.round(4).tolist()))

# Save model
joblib.dump(model, model_path)
print(f"💾 Model saved to {model_path}")

# Persist a verifiable training report -- previously the accuracy was only
# ever printed to stdout and lost, so there was no number anyone could
# actually check after the fact.
report_path = "ml/training_report.json"
with open(report_path, "w") as f:
    json.dump({
        "trained_at": datetime.datetime.utcnow().isoformat() + "Z",
        "n_samples": len(df),
        "n_train": len(X_train),
        "n_test": len(X_test),
        "features": list(X.columns),
        "n_features": len(X.columns),
        "model": "RandomForestClassifier",
        "hyperparameters": {"n_estimators": 100, "random_state": 42},
        "test_accuracy": round(accuracy, 4),
        "classification_report": report,
        "feature_importances": feature_importances,
    }, f, indent=2)
print(f"📄 Training report saved to {report_path}")
