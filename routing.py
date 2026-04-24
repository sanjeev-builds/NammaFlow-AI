import networkx as nx
import osmnx as ox
import json

def get_best_route(G, source_lat, source_lon, dest_lat, dest_lon):
    print("🚀 Computing best route...")

    # nearest nodes
    source = ox.distance.nearest_nodes(G, source_lon, source_lat)
    target = ox.distance.nearest_nodes(G, dest_lon, dest_lat)

    # shortest path using mixed distance-traffic density bounds
    path = nx.shortest_path(
        G,
        source,
        target,
        weight="weight"
    )

    print("✅ Route computed")
    return path

def route_to_coordinates(G, path):
    coords = []
    
    for node in path:
        x = G.nodes[node]['x']
        y = G.nodes[node]['y']
        coords.append([x, y])  # [lon, lat]

    return coords

def export_route_geojson(coords):
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": coords
        },
        "properties": {
            "type": "route"
        }
    }

    geojson = {
        "type": "FeatureCollection",
        "features": [feature]
    }

    with open("route.geojson", "w") as f:
        json.dump(geojson, f)

    print("✅ Route GeoJSON exported")

if __name__ == "__main__":
    place_name = "Bangalore, India"
    print("📡 Downloading Bangalore road network for routing engine...")
    G = ox.graph_from_place(place_name, network_type="drive", simplify=True)
    print("✅ Base Vector Topology Graph loaded!")

    print("🧨 Initializing physical edge weight parameters...")
    for u, v, k, data in G.edges(keys=True, data=True):
        # fallback if no density
        if "density" not in data:
            data["density"] = 0.1

        # mathematical algorithm for optimal routing choice (Distance + Traversal Resistance)
        length = data.get("length", 1)
        data["weight"] = length * (1 + data["density"] * 5)

    # Example: Silk Board → Hebbal
    print("📍 Tracking Silk Board → Hebbal metrics")
    route = get_best_route(
        G,
        12.9177, 77.6237,   # Silk Board (Lat, Lon)
        13.0358, 77.5970    # Hebbal (Lat, Lon)
    )

    coords = route_to_coordinates(G, route)
    export_route_geojson(coords)

    print("Route length:", len(coords))
