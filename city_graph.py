import osmnx as ox
import networkx as nx
import requests
import json
import traceback
import time
import random
import os
import tempfile

place_name = "Bangalore, India"

print("📡 Downloading Bangalore road network (Once)...")
try:
    # 🌟 Keep map locally in memory so we don't redownload 150MB per tick!
    G_base = ox.graph_from_place(place_name, network_type="drive", simplify=True)
    print("✅ Base Road Graph loaded into memory!")

    location_coords = {
        "Silk Board": (77.6220, 12.9177),
        "Whitefield": (77.7499, 12.9698),
        "Hebbal": (77.5970, 13.0358),
        "Electronic City": (77.6770, 12.8399),
        "Koramangala": (77.6245, 12.9352),
        "Indiranagar": (77.6412, 12.9719),
        "MG Road": (77.6050, 12.9756),
        "Marathahalli": (77.6974, 12.9591)
    }

    print("🚀 Initializing Autonomous GPU Daemon Loop...")

    while True:
        try:
            print(f"---\n[{time.strftime('%X')}] 📡 Fetching LIVE n8n traffic intelligence...")
            G = G_base.copy()

            try:
                # Query our God's Eye API directly
                traffic_data = requests.get("http://127.0.0.1:8000/traffic", timeout=5).json()
                print("🔥 HOTSPOTS COUNT:", len(traffic_data))
            except Exception:
                print("❌ API Offline. Standing by for next cycle...")
                traffic_data = []

            hotspots = {}
            for item in traffic_data:
                try:
                    # Mathematical normalization map onto 0.0-1.0 scale
                    density = min(1.0, item.get("congestion_score", 0) / 10.0)
                    if density > 0:
                        # Introduce fractional variance rendering to simulate breath/movement natively!
                        hotspots[item["location"]] = min(1.0, density * random.uniform(0.95, 1.05))
                except (KeyError, TypeError):
                    pass

            for n in G.nodes():
                G.nodes[n]['density'] = 0.0

            for loc, density in hotspots.items():
                if loc not in location_coords: continue
                lx, ly = location_coords[loc]
                source_node = ox.distance.nearest_nodes(G, lx, ly)
                
                # Expand calculation limit for bleeding edges visually
                cutoff_meters = 2500 
                lengths = nx.single_source_dijkstra_path_length(G, source_node, cutoff=cutoff_meters, weight='length')
                for n, dist in lengths.items():
                    influence = density * max(0.0, (1.0 - (dist / cutoff_meters)))
                    G.nodes[n]['density'] = min(1.0, G.nodes[n]['density'] + influence)

            for u, v, k in G.edges(keys=True):
                G[u][v][k]['density'] = max(G.nodes[u]['density'], G.nodes[v]['density'])

            features = []
            for u, v, data in G.edges(data=True):
                # Dropping dead roads entirely for massive WebGL framerate boosts
                if data.get("density", 0) <= 0.1: continue
                coords = list(data["geometry"].coords) if "geometry" in data else [(G.nodes[u]['x'], G.nodes[u]['y']), (G.nodes[v]['x'], G.nodes[v]['y'])]
                features.append({
                    "type": "Feature",
                    "geometry": { "type": "LineString", "coordinates": coords },
                    "properties": { "density": data.get("density", 0) }
                })

            geojson = { "type": "FeatureCollection", "features": features }

            # Perform a strict atomic swap to prevent payload tearing in frontend WebGL rendering
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.geojson', dir='.') as tmp:
                json.dump(geojson, tmp)
                tmp_name = tmp.name
            
            os.replace(tmp_name, "bangalore_traffic.geojson")

            print(f"✅ Extracted & Pushed {len(features)} physics vectors strictly to disk.")
        except Exception:
            print("❌ ASYNC ERROR:", traceback.format_exc())
            
        time.sleep(5) # Native 5 second infinite daemon heartbeat!

except Exception:
    print("❌ ROOT FATAL ERROR:", traceback.format_exc())
