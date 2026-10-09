"""Traffic-light color from a detection crop.

COCO's "traffic light" class has no color. The crop is converted to HSV and
the winning lamp color is the one with the most pixels. Too few colored
pixels means unknown, which is not treated as red.
"""

import cv2
import numpy as np

MIN_SIDE = 8
MIN_PIXELS = 15
MIN_FRACTION = 0.015

# OpenCV hue is 0-180. Red wraps around 0.
_RANGES = {
    "red": (
        (np.array([0, 70, 70]), np.array([10, 255, 255])),
        (np.array([170, 70, 70]), np.array([180, 255, 255])),
    ),
    "yellow": (
        (np.array([15, 70, 70]), np.array([35, 255, 255])),
    ),
    "green": (
        (np.array([40, 50, 50]), np.array([90, 255, 255])),
    ),
}


def classify_traffic_light(crop_bgr):
    """Return 'red', 'yellow', 'green', or 'unknown'."""
    if crop_bgr is None or crop_bgr.size == 0 or crop_bgr.ndim != 3:
        return "unknown"

    height, width = crop_bgr.shape[:2]
    if height < MIN_SIDE or width < MIN_SIDE:
        return "unknown"

    hsv = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2HSV)
    counts = {}
    for name, bounds in _RANGES.items():
        mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
        for lower, upper in bounds:
            mask = cv2.bitwise_or(mask, cv2.inRange(hsv, lower, upper))
        counts[name] = int(cv2.countNonZero(mask))

    best = max(counts, key=counts.get)
    if counts[best] < max(MIN_PIXELS, int(MIN_FRACTION * height * width)):
        return "unknown"
    return best
