/**
 * OpenRouteService (ORS) Utility for Bangalore Traffic Intelligence
 * Handles route calculation, ETA extraction, and geometry processing.
 * Uses the /geojson endpoint for pre-decoded coordinate arrays.
 */

const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;

// Use /geojson variant — returns decoded coordinates directly, no encoded polyline
const BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

export interface RouteData {
    distance: number; // in meters
    duration: number; // in seconds
    geometry: [number, number][]; // [lat, lng] for Leaflet
}

/**
 * Fetches routing data between two points using OpenRouteService.
 * @param start - [latitude, longitude]
 * @param end - [latitude, longitude]
 * @returns Cleaned route data or throws error
 */
export async function fetchRouteData(
    start: [number, number],
    end: [number, number]
): Promise<RouteData> {
    if (!ORS_API_KEY) {
        throw new Error("ORS API Key is missing. Please check NEXT_PUBLIC_ORS_API_KEY in .env");
    }

    // ORS expects [longitude, latitude]
    const coordinates = [
        [start[1], start[0]],
        [end[1], end[0]],
    ];

    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: ORS_API_KEY,
        },
        body: JSON.stringify({ coordinates }),
    });

    if (!response.ok) {
        let msg = `ORS API error: ${response.status}`;
        try {
            const err = await response.json();
            msg = err?.error?.message || msg;
        } catch (_) { }
        throw new Error(msg);
    }

    const data = await response.json();

    // GeoJSON format: { features: [{ geometry: { coordinates: [[lon,lat],...] }, properties: { summary: {...} } }] }
    const feature = data?.features?.[0];
    if (!feature) throw new Error("ORS returned no route features");

    const coordsRaw = feature?.geometry?.coordinates;
    if (!Array.isArray(coordsRaw) || coordsRaw.length === 0) {
        throw new Error("ORS returned empty geometry coordinates");
    }

    const summary = feature?.properties?.summary || {};

    // ORS GeoJSON uses [lon, lat] — swap to [lat, lon] for Leaflet
    const geometry = coordsRaw.map((coord: number[]) => [
        coord[1],
        coord[0],
    ]) as [number, number][];

    return {
        distance: summary.distance ?? 0,
        duration: summary.duration ?? 0,
        geometry,
    };
}

/**
 * Sample Usage for Bangalore Points
 * Example: Silk Board to Hebbal
 */
export async function sampleBangaloreRoute() {
    const silkBoard: [number, number] = [12.9177, 77.6238];
    const hebbal: [number, number] = [13.0358, 77.5970];

    try {
        const data = await fetchRouteData(silkBoard, hebbal);
        console.log("--- Bangalore Route Metric ---");
        console.log(`Distance: ${(data.distance / 1000).toFixed(2)} km`);
        console.log(`ETA: ${Math.round(data.duration / 60)} minutes`);
        return data;
    } catch (err) {
        console.error("Sample route failed", err);
    }
}
