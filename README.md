# ⛵ NammaFlow AI

**Event-aware traffic & crowd management for Bengaluru.** NammaFlow AI combines live traffic data, event feeds, weather, computer vision and ML forecasting to predict congestion around big events and recommend signal timings and alternate routes, through a live operations dashboard.

> **Status:** working prototype (hackathon / portfolio). The data pipeline, forecasting model, routing and dashboard run end to end. Camera feeds, the RL signal policy and the ML training data are simulated. See [Honest limitations](#️-honest-limitations).

---

## 🎯 The problem

Bengaluru is one of India's most congested cities. When a concert, match or rally lets out, crowds and vehicles surge at once:

- crowds pile up near venues, metro exits and junctions
- event inflow/outflow creates bottlenecks that spill across the city
- fixed-time signals and manual diversions react too slowly
- ambulances and police vehicles get stuck in the same jam

## 💡 What NammaFlow does

| Capability | How it works |
|---|---|
| **Live congestion map** | Pulls TomTom traffic + incidents and shows hotspots (Silk Board, Hebbal, Whitefield, MG Road, ...) on a Leaflet map |
| **Event awareness** | Pulls upcoming Bengaluru events from PredictHQ and filters them by time and proximity |
| **Congestion forecasting** | A scikit-learn Random Forest classifies traffic as LOW / MEDIUM / HIGH from 9 features (speed, vehicle count, weather, incidents, ETA, hour, peak flag, event intensity, Google traffic factor) |
| **Congestion-aware routing** | OSMnx road graph + forecast-weighted edge costs, so routes avoid roads predicted to jam |
| **What-if simulation** | `/simulate` applies time-of-day, rain and event-spike factors to the current density map |
| **Vehicle detection** | YOLOv8 + OpenCV count vehicles per camera stream |
| **Adaptive signals** | Rule-based `SignalController` (emergency priority, density-scaled green time) plus an experimental Deep Q-Network over a 3-junction graph |
| **Assistant** | A dashboard chat box that answers questions about current hotspots |

## 🏗️ Architecture

```
 TomTom ──────┐                                    ┌─► Live map (Leaflet)
 PredictHQ ───┤   FastAPI backend (main.py :8000)  ├─► Congestion chart / timeline
 OpenWeather ─┼─►  • traffic state + history  ────►├─► Forecast panel (RandomForest)
 CCTV / RTSP ─┤    • event filtering               ├─► Route planner (OSMnx)
 (YOLOv8)  ───┘    • /forecast /route /simulate    └─► Optimization suggestions
                          │
                          └─► ml/model.pkl  (trained RandomForest)

 Next.js 16 dashboard (BLRF/ :3000) ── calls the backend at localhost:8000
 Next.js route /api/predict ── runs ml/predict.py with the 9 features
```

There are two Python entry points:

- **`main.py`**: the backend the dashboard talks to (traffic, events, routing, forecast, simulation, assistant).
- **`src/traffic_ai/api.py`**: the packaged FastAPI service used by the `Dockerfile` (live intersection state, alerts, N8N webhook endpoints, `/route`, `/simulate`, `/forecast`, `/chat`).

## 📁 Repository layout

```
main.py                    Backend used by the dashboard (FastAPI)
routing.py, city_graph.py  OSMnx road graph and forecast-weighted routing
fetch_events.py            Standalone PredictHQ event fetch
ml/                        Synthetic data generator, trainer, predictor, model.pkl, training_report.json
src/traffic_ai/            Core package: controller, simulator, pipeline, storage (SQLite),
                           alerts, graph engine, multi-camera vision, RL agent, API
src/data_ingestion/        TomTom, OpenWeather and vision ingestors
BLRF/                      Next.js 16 + React 19 dashboard (Tailwind, shadcn/ui, Leaflet, Recharts)
scripts/                   run_demo.py, run_engine.py, test_vision.py
tests/                     Unit tests for the controller and decision pipeline
docker-compose.yml         TimescaleDB for telemetry storage
```

## 🚀 Getting started

**Requirements:** Python 3.10+, Node.js 18+ (20+ recommended).

### 1. Configure API keys

Copy `.env.example` to `.env` and fill in what you have. Missing keys fall back to mock or cached data where the code supports it.

| Variable | Used for |
|---|---|
| `TOMTOM_API_KEY` | Live traffic flow and incidents |
| `PREDICTHQ_API_KEY` | Event feed |
| `OPENWEATHER_API_KEY` | Weather input |
| `GEMINI_API_KEY` | Optional AI features |
| `BENGALURU_LAT` / `BENGALURU_LON` | City centre (defaults to 12.9716, 77.5946) |
| `RTSP_*` | Camera stream URLs for the vision ingestor |
| `NEXT_PUBLIC_ORS_API_KEY` | OpenRouteService routing in the dashboard |

### 2. Run the backend

```bash
python -m pip install -e .
python -m uvicorn main:app --reload --port 8000
```

### 3. Run the dashboard

```bash
cd BLRF
npm install
npm run dev        # http://localhost:3000
```

### 4. Train / refresh the forecast model (optional)

```bash
python ml/generate_data.py   # writes ml/traffic_data.csv
python ml/train_model.py     # writes ml/model.pkl and ml/training_report.json
```

### 5. Run the starter demos and tests

```bash
PYTHONPATH=src python scripts/run_demo.py      # synthetic surge vs. adaptive signal plan
PYTHONPATH=src python scripts/run_engine.py    # decision records per intersection
PYTHONPATH=src python -m unittest discover -s tests -v
```

### Docker

```bash
docker build -t nammaflow-ai .
docker run -p 8000:8000 nammaflow-ai     # serves traffic_ai.api:app
docker compose up -d                     # optional TimescaleDB (set POSTGRES_PASSWORD in .env)
```

## 🔌 Main API endpoints (`main.py`)

| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/traffic` | Current hotspot state; ingest an update |
| GET | `/traffic/history` | Recent congestion history for the chart |
| POST | `/forecast` | Congestion forecast |
| POST | `/route` | Congestion-aware route between two coordinates |
| GET | `/events/cards`, `/events/filtered` | Upcoming events, optionally filtered |
| GET | `/incidents` | Live incident feed |
| POST | `/simulate` | What-if scenario (hour, rain, event spike) |
| GET | `/optimization/suggest` | Recommended interventions |
| POST | `/assistant/chat` | Dashboard assistant |

FastAPI also serves interactive docs at `http://localhost:8000/docs`.

## 📊 Model performance

The Random Forest (100 trees, 9 features, 800 train / 200 test) scores **99.5% test accuracy**. This number comes from a **synthetic** dataset where the label is generated from the same features, so it shows the pipeline works, not real-world accuracy. Full per-class metrics are in `ml/training_report.json`.

## ⚠️ Honest limitations

- **Training data is synthetic** (`ml/generate_data.py`). The model has not been validated against real Bengaluru traffic history.
- **Camera input is a demo.** Vision runs on `sample_traffic.mp4` / mock counts; the RTSP URLs in `.env.example` are placeholders.
- **The RL signal policy is experimental.** It is trained in simulation on a 3-node graph and is not deployed. The live controller is the rule-based `SignalController`.
- **Signal commands are not sent to real hardware.** Output is recommendations on the dashboard and in the API.
- **The assistant is rule-based.** It reads the live hotspot state and does not call an LLM.
- The dashboard has the backend URL (`http://localhost:8000`) hardcoded and has no authentication yet.

## 🗺️ Roadmap

1. Train on real historical traffic and validate with a time-based split.
2. Replace mock camera data with real RTSP ingestion.
3. Move telemetry from SQLite to TimescaleDB and add alert rules (critical crowd density, emergency-corridor conflicts).
4. Evaluate the RL policy against the baseline controller on event-surge simulations.
5. Make the backend URL configurable and add authentication to the dashboard and API.
6. Digital twin of Bengaluru flows and crowd-evacuation planning.

## 🧰 Tech stack

**Backend:** Python, FastAPI, scikit-learn, PyTorch, OpenCV, Ultralytics YOLOv8, OSMnx / NetworkX, SQLite, TimescaleDB
**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Leaflet, Recharts
**Data sources:** TomTom, PredictHQ, OpenWeather, OpenRouteService, OpenStreetMap

## 📄 License & Copyright

**Copyright (c) 2026 Sanjeev. All Rights Reserved.**

This project is public strictly for **portfolio demonstration and evaluation**. You may read the code to assess my skills. You may **not** copy, clone, distribute or modify any part of it for academic, personal or commercial use without my explicit written permission. See [LICENSE](LICENSE).
