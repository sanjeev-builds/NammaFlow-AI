import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Features: speed, vehicle_count, weather, incident_score, eta, hour, is_peak
        // Defaulting missing values to prevent ML errors
        const features = {
            speed: body.speed || 30,
            vehicle_count: body.vehicle_count || 50,
            weather: body.weather || 0,
            incident_score: body.incident_score || 0,
            eta: body.eta || 15,
            hour: body.hour || new Date().getHours(),
            is_peak: body.is_peak || (new Date().getHours() >= 8 && new Date().getHours() <= 10 ? 1 : 0),
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
