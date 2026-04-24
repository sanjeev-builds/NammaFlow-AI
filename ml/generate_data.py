import pandas as pd
import numpy as np
import random

# Generate 1000 synthetic records for training
data = []
for _ in range(1000):
    hour = random.randint(0, 23)
    is_peak = 1 if (8 <= hour <= 10 or 17 <= hour <= 20) else 0
    
    # Baseline speed based on peak hour
    base_speed = random.randint(15, 30) if is_peak else random.randint(35, 60)
    
    # Vehicle count proportional to peak
    vehicle_count = random.randint(70, 150) if is_peak else random.randint(20, 70)
    
    # Environmental factors
    weather = random.choice([0, 1])
    incident_score = random.uniform(0, 1)
    
    # Event intensity
    event_intensity = round(random.uniform(0.4, 1.0) if is_peak else random.uniform(0, 0.4), 2)
    
    # Google traffic factor: free_flow / current_speed ratio
    # Peaks have higher factors (more congestion)
    google_traffic_factor = round(random.uniform(1.3, 2.0) if is_peak else random.uniform(0.9, 1.3), 2)
    
    # Final observed speed
    speed = base_speed - (incident_score * 15) - (weather * 10) - (event_intensity * 8)
    speed = max(5, speed)
    
    eta = random.randint(20, 60) if speed < 25 else random.randint(10, 25)
    
    # Labels — google_traffic_factor adds decisive signal
    if (speed < 22 and incident_score > 0.5) or event_intensity > 0.8 or google_traffic_factor > 1.7:
        congestion = 2  # HIGH
    elif speed < 35 or event_intensity > 0.5 or google_traffic_factor > 1.3:
        congestion = 1  # MEDIUM
    else:
        congestion = 0  # LOW
        
    data.append([speed, vehicle_count, weather, incident_score, eta, hour, is_peak, event_intensity, google_traffic_factor, congestion])

df = pd.DataFrame(data, columns=[
    "speed", "vehicle_count", "weather", "incident_score", "eta",
    "hour", "is_peak", "event_intensity", "google_traffic_factor", "congestion"
])

df.to_csv("ml/traffic_data.csv", index=False)
print("✅ Dataset generated with google_traffic_factor feature: ml/traffic_data.csv")
