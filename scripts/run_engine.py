#!/usr/bin/env python3
"""Run one-shot recommendations for multiple intersections."""

from traffic_ai.pipeline import TrafficDecisionEngine
from traffic_ai.providers import MockEventProvider
from traffic_ai.storage import SQLiteStorage

def main() -> None:
    provider = MockEventProvider(seed=21)
    logger = SQLiteStorage()
    engine = TrafficDecisionEngine(provider=provider, logger=logger)

    intersections = ["mg_road", "silk_board", "hebbal", "majestic"]

    print("intersection,vehicles,crowd,emergency,green_s,red_s,reason")
    for intersection in intersections:
        decision = engine.run_once(intersection)
        s, p = decision.snapshot, decision.plan
        print(
            f"{intersection},{s.vehicle_count},{s.crowd_density},{s.emergency_vehicle_present},"
            f"{p.green_seconds},{p.red_seconds},{p.reason}"
        )


if __name__ == "__main__":
    main()
