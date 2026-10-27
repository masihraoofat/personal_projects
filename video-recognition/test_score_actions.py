"""A one-frame false stop should count against the raw rule and not the hold."""

import tempfile
import unittest
from pathlib import Path

from score_actions import format_report, load_actions, load_labels, score


class ScoreActionsTest(unittest.TestCase):
    def test_hold_removes_a_one_frame_false_stop_and_delays_a_real_one(self):
        # One false stop, then four frames that really are a stop.
        actions = [
            (0, "KEEP MOVING"),
            (2, "STOP (person)"),
            (0, "KEEP MOVING"),
            (0, "KEEP MOVING"),
            (2, "STOP (red light)"),
            (2, "STOP (red light)"),
            (2, "STOP (red light)"),
            (2, "STOP (red light)"),
        ]
        expected = ["keep", "keep", "keep", "keep", "stop", "stop", "stop", "stop"]
        report = score(actions, expected, hold_frames=3)

        self.assertEqual(report["per_frame"]["false_stops"], 1)
        self.assertEqual(report["per_frame"]["missed_stops"], 0)
        self.assertEqual(report["per_frame"]["flips"], 3)
        self.assertEqual(report["held"]["false_stops"], 0)
        self.assertEqual(report["held"]["missed_stops"], 2)
        self.assertEqual(report["held"]["flips"], 1)
        self.assertIn("false stops", format_report(report))

    def test_label_file_rejects_an_overlapping_clip(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "labels.csv"
            path.write_text(
                "start_frame,end_frame,expected\n0,2,keep\n2,3,stop\n",
                encoding="utf-8",
            )
            with self.assertRaises(ValueError):
                load_labels(path, frame_count=4)

    def test_action_log_round_trip(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "frame_actions.csv"
            path.write_text(
                "frame,rank,label\n0,0,KEEP MOVING\n1,2,STOP (person)\n",
                encoding="utf-8",
            )
            self.assertEqual(
                load_actions(path),
                [(0, "KEEP MOVING"), (2, "STOP (person)")],
            )


if __name__ == "__main__":
    unittest.main()
