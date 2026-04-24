#!/usr/bin/env python3
import urllib.request
import os
from traffic_ai.vision_adapter import VisionAdapter
from traffic_ai.controller import SignalController

VIDEO_URL = "https://github.com/intel-iot-devkit/sample-videos/raw/master/car-detection.mp4"
VIDEO_PATH = "sample_traffic.mp4"

def main():
    if not os.path.exists(VIDEO_PATH):
        print(f"Downloading sample traffic video from {VIDEO_URL}...")
        urllib.request.urlretrieve(VIDEO_URL, VIDEO_PATH)
        print("Download complete!\n")

    adapter = VisionAdapter(camera_url=VIDEO_PATH)
    controller = SignalController()

    print("--- Starting AI Traffic Vision Test ---")
    
    # Process the first 120 frames of the video
    print("Scanning video frames... waiting for cars...")
    frames_processed = 0
    for i in range(120):
        snapshot = adapter.get_snapshot("virtual_intersection")
        
        if snapshot.vehicle_count > 0 or snapshot.crowd_density > 0:
            plan = controller.recommend(snapshot)
            print(f"\n[Frame {i+1}]")
            print(f"  AI Detected -> Vehicles: {snapshot.vehicle_count}, Person Density: {snapshot.crowd_density}")
            print(f"  Decision    -> {plan.green_seconds} seconds GREEN. Reason: '{plan.reason}'")
            frames_processed += 1
            
        if frames_processed >= 5:
            break

if __name__ == "__main__":
    main()
