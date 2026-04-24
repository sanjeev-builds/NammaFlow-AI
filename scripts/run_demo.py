#!/usr/bin/env python3
"""Run a small demo of adaptive traffic recommendations."""

from traffic_ai.controller import SignalController
from traffic_ai.simulator import generate_event_surge


def main() -> None:
    controller = SignalController()

    print("time_step,vehicle_count,crowd_density,emergency,green_s,red_s,reason")
    for idx, snap in enumerate(generate_event_surge(steps=12), start=1):
        plan = controller.recommend(snap)
        print(
            f"{idx},{snap.vehicle_count},{snap.crowd_density},{snap.emergency_vehicle_present},"
            f"{plan.green_seconds},{plan.red_seconds},{plan.reason}"
        )


if __name__ == "__main__":
    main()
