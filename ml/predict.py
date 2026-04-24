import sys
import json
import joblib
import pandas as pd
import os
import warnings

# Suppress warnings for clean stdout (essential for spawn bridge)
warnings.filterwarnings("ignore")

model_path = os.path.join(os.path.dirname(__file__), "model.pkl")

try:
    if not os.path.exists(model_path):
        print(json.dumps({"error": "Model file not found. Run training first."}))
        sys.exit(1)

    model = joblib.load(model_path)

    # Read JSON input from CLI argument
    raw_input = sys.argv[1]
    data = json.loads(raw_input)

    # Convert to DataFrame — must match training feature order exactly
    df = pd.DataFrame([data], columns=[
        "speed", "vehicle_count", "weather",
        "incident_score", "eta", "hour", "is_peak",
        "event_intensity", "google_traffic_factor"
    ])

    # Prediction
    prediction = int(model.predict(df)[0])
    
    # Map index to label
    labels = ["LOW", "MEDIUM", "HIGH"]
    result = labels[prediction]

    # Return as JSON string for the Node.js bridge to parse
    print(json.dumps({"prediction": result, "class_id": prediction}))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
