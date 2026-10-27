import unittest

from decision import frame_action


class FrameActionTest(unittest.TestCase):
    def test_person_stops_and_a_weak_detection_does_not(self):
        self.assertEqual(frame_action([("person", 0.8, None)]), (2, "STOP (person)"))
        self.assertEqual(frame_action([("person", 0.5, None)]), (0, "KEEP MOVING"))

    def test_only_a_red_light_stops(self):
        self.assertEqual(
            frame_action([("traffic light", 0.9, "red")]),
            (2, "STOP (red light)"),
        )
        self.assertEqual(
            frame_action([("traffic light", 0.9, "green")]),
            (0, "KEEP MOVING"),
        )
        self.assertEqual(
            frame_action([("traffic light", 0.9, "unknown")]),
            (0, "KEEP MOVING"),
        )

    def test_person_outranks_a_yellow_light(self):
        detections = [
            ("traffic light", 0.9, "yellow"),
            ("person", 0.8, None),
        ]
        self.assertEqual(frame_action(detections), (2, "STOP (person)"))


if __name__ == "__main__":
    unittest.main()
