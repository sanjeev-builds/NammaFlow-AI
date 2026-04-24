import unittest

from traffic_ai.controller import SignalController
from traffic_ai.schemas import IntersectionSnapshot


class SignalControllerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.controller = SignalController(min_green=20, max_green=90, cycle_time=120)

    def test_emergency_vehicle_gets_priority(self) -> None:
        snap = IntersectionSnapshot(vehicle_count=10, crowd_density=0.1, emergency_vehicle_present=True)
        plan = self.controller.recommend(snap)
        self.assertEqual(plan.green_seconds, 90)
        self.assertGreaterEqual(plan.red_seconds, 10)

    def test_low_pressure_uses_min_green(self) -> None:
        snap = IntersectionSnapshot(vehicle_count=10, crowd_density=0.1)
        plan = self.controller.recommend(snap)
        self.assertEqual(plan.green_seconds, 20)

    def test_severe_pressure_uses_max_green(self) -> None:
        snap = IntersectionSnapshot(vehicle_count=130, crowd_density=0.9)
        plan = self.controller.recommend(snap)
        self.assertEqual(plan.green_seconds, 90)


if __name__ == "__main__":
    unittest.main()
