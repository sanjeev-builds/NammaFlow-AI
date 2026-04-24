import { NextResponse } from "next/server";

/**
 * Google Traffic Factor — computed from TomTom live speed data.
 * Replicates Distance Matrix's duration_in_traffic / duration ratio
 * without requiring Google billing.
 * 
 * traffic_factor = free_flow_speed / current_speed
 *   < 1.2  → LOW
 *   1.2–1.5 → MEDIUM
 *   > 1.5  → HIGH
 */

// Key Bangalore corridors with known free-flow speeds (km/h)
const CORRIDORS = [
    { name: "Silk Board", lat: 12.9177, lon: 77.6238, freeFlow: 45 },
    { name: "Hebbal", lat: 13.0358, lon: 77.5970, freeFlow: 50 },
    { name: "MG Road", lat: 12.9756, lon: 77.6065, freeFlow: 40 },
    { name: "Whitefield", lat: 12.9698, lon: 77.7500, freeFlow: 50 },
    { name: "Electronic City", lat: 12.8399, lon: 77.6770, freeFlow: 55 },
];

export async function GET() {
    try {
        const TOMTOM_KEY = process.env.TOMTOM_KEY || process.env.TOMTOM_API_KEY;

        const results = [];

        for (const corridor of CORRIDORS) {
            let currentSpeed = corridor.freeFlow * 0.6; // fallback estimate
            let factor = 1.0;

            if (TOMTOM_KEY) {
                try {
                    const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${corridor.lat},${corridor.lon}&key=${TOMTOM_KEY}`;
                    const res = await fetch(url, { next: { revalidate: 30 } }); // cache 30s

                    if (res.ok) {
                        const data = await res.json();
                        const flow = data?.flowSegmentData || {};
                        currentSpeed = flow.currentSpeed || currentSpeed;
                        const freeFlowLive = flow.freeFlowSpeed || corridor.freeFlow;
                        factor = freeFlowLive / Math.max(currentSpeed, 1);
                    }
                } catch (_) { }
            }

            // Classification
            let level: "LOW" | "MEDIUM" | "HIGH" = "LOW";
            if (factor > 1.5) level = "HIGH";
            else if (factor > 1.2) level = "MEDIUM";

            results.push({
                corridor: corridor.name,
                lat: corridor.lat,
                lon: corridor.lon,
                current_speed: Math.round(currentSpeed),
                free_flow_speed: corridor.freeFlow,
                traffic_factor: Math.round(factor * 100) / 100,
                congestion_level: level,
            });
        }

        // System-wide aggregate factor (average across all corridors)
        const avgFactor = results.reduce((s, r) => s + r.traffic_factor, 0) / results.length;

        let systemLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
        if (avgFactor > 1.5) systemLevel = "HIGH";
        else if (avgFactor > 1.2) systemLevel = "MEDIUM";

        return NextResponse.json({
            corridors: results,
            system_traffic_factor: Math.round(avgFactor * 100) / 100,
            system_congestion: systemLevel,
        });
    } catch (err) {
        return NextResponse.json({ error: "Traffic factor computation failed" }, { status: 500 });
    }
}
