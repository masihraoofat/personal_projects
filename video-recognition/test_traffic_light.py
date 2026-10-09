"""Synthetic crops so the color rule can be checked without a dashcam video."""

import unittest

import cv2
import numpy as np

from traffic_light import classify_traffic_light


def _lamp(color_bgr):
    image = np.zeros((80, 40, 3), dtype=np.uint8)
    image[:] = (30, 30, 30)
    cv2.circle(image, (20, 40), 12, color_bgr, -1)
    return image


class TrafficLightColorTest(unittest.TestCase):
    def test_red_yellow_and_green(self):
        self.assertEqual(classify_traffic_light(_lamp((0, 0, 220))), "red")
        self.assertEqual(classify_traffic_light(_lamp((0, 220, 220))), "yellow")
        self.assertEqual(classify_traffic_light(_lamp((0, 180, 0))), "green")

    def test_dark_crop_is_unknown(self):
        dark = np.zeros((80, 40, 3), dtype=np.uint8)
        self.assertEqual(classify_traffic_light(dark), "unknown")

    def test_tiny_crop_is_unknown(self):
        tiny = np.zeros((4, 4, 3), dtype=np.uint8)
        tiny[:] = (0, 0, 255)
        self.assertEqual(classify_traffic_light(tiny), "unknown")


if __name__ == "__main__":
    unittest.main()
