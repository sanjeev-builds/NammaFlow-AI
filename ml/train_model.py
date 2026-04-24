import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

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

# Save model
joblib.dump(model, model_path)
print(f"💾 Model saved to {model_path}")
