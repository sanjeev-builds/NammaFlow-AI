import { NextResponse } from "next/server";

export async function GET() {
    try {
        const apiKey = process.env.TOMTOM_KEY || process.env.TOMTOM_API_KEY;

        // Bounding box for Bangalore (approx)
        const bbox = "77.50,12.90,77.70,13.10";
        const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?bbox=${bbox}&key=${apiKey}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory}}}`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`TomTom API responded with ${res.status}`);
        }

        const data = await res.json();

        // Map and transform the data into a clean structure for the frontend map & ML model
        const incidents = (data.incidents || []).map((i: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            type: i.properties?.iconCategory || "Unknown",
            lat: i.geometry?.coordinates[1],
            lon: i.geometry?.coordinates[0],
            raw: i // preserve for detailed analytics if needed
        }));

        return NextResponse.json(incidents);
    } catch (err) {
        console.error("TomTom Ingest Error:", err);
        return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
    }
}
