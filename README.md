# ⛵ NammaFlow AI - Intelligent Traffic & Crowd Management System

## 📌 Core Idea

The **main goal of this project is to manage very large crowds during major events in Bangalore** (concerts, festivals, sports events, political gatherings, protests, etc.) while keeping city traffic moving safely.

Bangalore is already one of India’s most congested urban areas. During big events, sudden crowd surges and vehicle spikes can quickly create city-wide gridlock, unsafe crowd pressure points, delayed emergency response, and accident risk.

NammaFlow AI is a' predictive, adaptive, event-aware system that shifts control from a static, reactive model to a data-driven intelligence platform.

## 🎯 Problem Statement

During high-footfall events in Bangalore, authorities face four connected challenges:

- **Crowd concentration** near venues, metro exits, and junctions
- **Vehicle bottlenecks** caused by event inflow/outflow peaks
- **Poor coordination** between signal timings, road diversions, and crowd movement
- **Slow emergency movement** when ambulances or police vehicles need priority

Fixed-time traffic signals and manual interventions are often too slow for these dynamic conditions.

## 💡 Proposed Solution

The system combines real-time sensing, AI prediction, and dynamic control:

1. **Real-time monitoring**
   - CCTV feeds
   - IoT traffic counters
   - GPS/map traffic data
   - Event schedule + crowd-zone inputs
2. **Vehicle and crowd detection**
   - Computer Vision models (YOLO/CNN)
   - Density estimation for roads and pedestrian hotspots
   - Vehicle type classification (bus, car, emergency vehicles)
3. **Congestion forecasting**
   - ML models trained on historical + live streams
   - Early warning before severe build-up
4. **Adaptive signal control**
   - Dynamic green/red allocation by density
   - Emergency vehicle prioritization
   - Reduced queue spillback at intersections
5. **Crowd-aware route management**
   - Alternate route suggestions for vehicles
   - Controlled dispersal around event zones
   - Prevention of overcrowding on vulnerable corridors

## ⚙️ System Architecture

### 🔹 Input Layer
- CCTV feeds
- Traffic IoT sensors
- GPS and map speed data
- Event/crowd metadata

### 🔹 Processing Layer
- Preprocessing and filtering (OpenCV)
- Vehicle/crowd detection (YOLOv8/CNN)
- Short-term forecasting (LSTM/Regression)

### 🔹 Decision Layer
- Reinforcement Learning / optimization policies
- Signal timing recommendation engine
- Route diversion and crowd-flow control engine

### 🔹 Output Layer
- Smart signal timing commands
- Live command dashboard for city authorities
- API outputs for maps/public information systems

## 🧠 Technologies

- Python
- OpenCV
- YOLO / CNN-based detection
- TensorFlow / PyTorch
- LSTM / regression forecasting models
- IoT edge sensors and traffic APIs

## 📊 Key Capabilities

- ✅ Real-time crowd + traffic visibility
- ✅ Event-sensitive congestion prediction
- ✅ Adaptive intersection control
- ✅ Emergency lane/signal prioritization
- ✅ City-scale deployment support for smart-city operations

## 🚀 Expected Impact

- Lower event-time congestion and travel delays
- Faster emergency access during crowd peaks
- Reduced accident probability in high-density zones
- Better commuter experience during major city events
- Data support for long-term Bangalore mobility planning

## 🔬 Future Scope

- Digital twin of Bangalore traffic + crowd flows
- Integration with autonomous and connected vehicles
- AI-assisted crowd evacuation planning
- Deeper integration with smart-city control centers

## 🏁 Conclusion

This project focuses on Bangalore’s most critical mobility challenge: **managing large crowds and traffic surges during major events**. By combining computer vision, ML prediction, and adaptive control, the system can help prevent chaos, reduce congestion, and improve public safety in one of the world’s busiest urban environments.

## 🛠️ Phase 1: Project Kickoff (Implemented)

This repository now includes a **starter implementation** so development can begin immediately:

- `src/traffic_ai/controller.py`: baseline adaptive signal controller
- `src/traffic_ai/simulator.py`: synthetic event-surge traffic/crowd generator
- `src/traffic_ai/schemas.py`: shared data structures
- `scripts/run_demo.py`: runnable CLI demo
- `tests/test_controller.py`: baseline unit tests for signal logic

### Quick Start

```bash
python -m pip install -e .
python scripts/run_demo.py
python -m unittest discover -s tests -v
```

## 📍 Next Milestones

1. Integrate real CCTV + IoT ingestion connectors.
2. Replace heuristic controller with learned policy (RL/optimization).
3. Add route recommendation service with map API integration.
4. Build operations dashboard for city traffic police and planners.

## ✅ Now What? (Immediate Build Path)

If you’re asking **“now what?”**, the next practical step is to move from isolated models to an executable city-control loop. This repository now supports that path with a decision engine layer and mock provider.

### New immediate flow

1. Fetch snapshot data (currently via `MockEventProvider`, later CCTV/IoT adapters).
2. Run adaptive signal recommendation using `SignalController`.
3. Emit a decision record per intersection for dashboard/API integration.

Run it with:

```bash
PYTHONPATH=src python scripts/run_engine.py
```

### 7-day execution plan

- **Day 1–2:** Build real data adapters (camera counts, sensor streams, map speed API).
- **Day 3–4:** Add persistence (SQLite/Postgres) for snapshots + decisions.
- **Day 5:** Add alert rules (critical crowd density, emergency corridor conflicts).
- **Day 6:** Add REST endpoints for traffic-command dashboard integration.
- **Day 7:** Run event simulation and compare baseline vs adaptive delay metrics.

## 📄 License & Copyright

**Copyright (c) 2026 Sanjeev. All Rights Reserved.**

This project is made public strictly for **portfolio demonstration and evaluation purposes**. 

You are welcome to read the code to assess my skills. However, **you are not allowed to copy, clone, distribute, or modify** any portion of this codebase for academic, personal, or commercial use without my explicit written permission.

See the [LICENSE](LICENSE) file for more details.

