"""The displayed action waits out a one-frame false detection."""

import unittest

from action_smoother import ActionSmoother


class ActionSmootherTest(unittest.TestCase):
    def test_one_frame_stop_does_not_flip(self):
        smoother = ActionSmoother(hold_frames=3)
        shown = smoother.update(2, "STOP (person)")
        self.assertEqual(shown, (0, "KEEP MOVING"))
        shown = smoother.update(0, "KEEP MOVING")
        self.assertEqual(shown, (0, "KEEP MOVING"))

    def test_repeated_stop_is_published(self):
        smoother = ActionSmoother(hold_frames=3)
        labels = []
        for _ in range(3):
            labels.append(smoother.update(2, "STOP (red light)"))
        self.assertEqual(labels, [
            (0, "KEEP MOVING"),
            (0, "KEEP MOVING"),
            (2, "STOP (red light)"),
        ])

    def test_a_different_action_restarts_the_count(self):
        smoother = ActionSmoother(hold_frames=3)
        smoother.update(2, "STOP (person)")
        smoother.update(2, "STOP (person)")
        shown = smoother.update(1, "CAUTION (yellow light)")
        self.assertEqual(shown, (0, "KEEP MOVING"))
        smoother.update(1, "CAUTION (yellow light)")
        shown = smoother.update(1, "CAUTION (yellow light)")
        self.assertEqual(shown, (1, "CAUTION (yellow light)"))

    def test_clearing_a_stop_also_waits(self):
        smoother = ActionSmoother(hold_frames=2)
        smoother.update(2, "STOP (person)")
        smoother.update(2, "STOP (person)")
        shown = smoother.update(0, "KEEP MOVING")
        self.assertEqual(shown, (2, "STOP (person)"))
        shown = smoother.update(0, "KEEP MOVING")
        self.assertEqual(shown, (0, "KEEP MOVING"))


if __name__ == "__main__":
    unittest.main()
