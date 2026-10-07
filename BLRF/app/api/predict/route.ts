import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Features: all 9 columns ml/train_model.py was trained on, in that
        // exact order. Previously only 7 were sent here -- event_intensity
        // and google_traffic_factor were missing, which made ml/predict.py
        // build a DataFrame with 2 NaN columns and crash inside
        // RandomForestClassifier.predict() (plain forests don't accept NaN).
        // Defaulting missing values to prevent ML errors.
        const currentHour = body.hour ?? new Date().getHours();
        const features = {
            speed: body.speed ?? 30,
            vehicle_count: body.vehicle_count ?? 50,
            weather: body.weather ?? 0,
            incident_score: body.incident_score ?? 0,
            eta: body.eta ?? 15,
            hour: currentHour,
            is_peak: body.is_peak ?? (currentHour >= 8 && currentHour <= 10 ? 1 : 0),
            event_intensity: body.event_intensity ?? 0,
            google_traffic_factor: body.google_traffic_factor ?? 1.0,
        };

        const pythonScript = path.join(process.cwd(), "..", "ml", "predict.py");

        return new Promise((resolve) => {
            let output = "";
            const pythonProcess = spawn("python", [pythonScript, JSON.stringify(features)]);

            pythonProcess.stdout.on("data", (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                console.error(`Python Error: ${data}`);
            });

            pythonProcess.on("close", (code) => {
                if (code !== 0) {
                    resolve(NextResponse.json({ error: "Prediction failed" }, { status: 500 }));
                    return;
                }
                try {
                    const result = JSON.parse(output);
                    resolve(NextResponse.json(result));
                } catch (e) {
                    resolve(NextResponse.json({ error: "Invalid response from ML engine" }, { status: 500 }));
                }
            });
        });
    } catch (err) {
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
}
