import unittest

from traffic_ai.pipeline import TrafficDecisionEngine
from traffic_ai.providers import MockEventProvider


class PipelineTests(unittest.TestCase):
    def test_engine_returns_decision_record(self) -> None:
        engine = TrafficDecisionEngine(provider=MockEventProvider(seed=1))
        result = engine.run_once("silk_board")

        self.assertEqual(result.intersection_id, "silk_board")
        self.assertGreaterEqual(result.snapshot.vehicle_count, 0)
        self.assertGreaterEqual(result.plan.green_seconds, 20)

    def test_provider_is_deterministic_for_same_seed(self) -> None:
        p1 = MockEventProvider(seed=5)
        p2 = MockEventProvider(seed=5)

        s1 = p1.get_snapshot("hebbal")
        s2 = p2.get_snapshot("hebbal")

        self.assertEqual(s1, s2)


if __name__ == "__main__":
    unittest.main()
