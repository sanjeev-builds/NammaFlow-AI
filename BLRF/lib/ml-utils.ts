/**
 * ML Feature Engineering & Normalization Utility
 * Upgrades raw incident data into weighted intelligence for the traffic model.
 */

export interface Incident {
    type: string; // iconCategory from TomTom
    lat: number;
    lon: number;
    id?: string;
    timestamp?: number;
}

/**
 * Maps TomTom iconCategory to numeric severity
 * 1: Accident -> 3 (High)
 * 2: Roadworks -> 2 (Medium)
 * 3: Congestion -> 2 (Medium)
 * 4: Hazard -> 1 (Low)
 */
export function getIncidentSeverity(type: string | number): number {
    const t = typeof type === 'string' ? type.toLowerCase() : type;

    if (t === 'accident' || t === 1) return 3;
    if (t === 'roadworks' || t === 2) return 2;
    if (t === 'congestion' || t === 3) return 2;
    if (t === 'hazard' || t === 4) return 1;
    return 1; // Fallback for other categories
}

/**
 * Basic Euclidean distance calculation for local weighting
 */
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return Math.sqrt(
        Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2)
    );
}

/**
 * Aggregates all incidents into a single normalized score [0, 1]
 * for a specific coordinate (e.g., a traffic zone).
 */
export function calculateWeightedIncidentScore(
    zoneLat: number,
    zoneLon: number,
    incidents: Incident[]
): number {
    const weightedScore = incidents.reduce((sum, i) => {
        const d = getDistance(zoneLat, zoneLon, i.lat, i.lon);

        // Distance weight: 
        // Very Close (<2km approx @ 0.02 deg) -> 1.0 impact
        // Close (<5km approx @ 0.05 deg) -> 0.5 impact
        // Far -> 0.2 impact
        const impact = d < 0.02 ? 1 : d < 0.05 ? 0.5 : 0.2;

        return sum + getIncidentSeverity(i.type) * impact;
    }, 0);

    // Normalization: Cap at 10 and map to [0, 1]
    return Math.min(weightedScore / 10, 1);
}

/**
 * Returns a human-friendly classification for the UI
 */
export function getIncidentDisruptionLevel(score: number): string {
    if (score > 0.7) return "High impact accident";
    if (score > 0.3) return "Moderate disruption";
    if (score > 0) return "Minor issue";
    return "Clear";
}
