"""Per-frame driving action from detections.

Rank 2 is stop, rank 1 is caution, rank 0 is keep moving. A weaker
action cannot replace a stronger one in the same frame. Traffic-light
color is supplied by the caller; green and unknown do not stop.
"""

STOP_NAMES = ("stop sign", "person", "bicycle")
CONFIDENCE_MIN = 0.5


def frame_action(detections, confidence_min=CONFIDENCE_MIN):
    """Return (rank, label) for one frame.

    Each detection is (name, confidence, light_color). light_color is
    only used for traffic lights.
    """
    action_rank = 0
    action_label = "KEEP MOVING"

    for name, confidence, light_color in detections:
        if confidence <= confidence_min:
            continue
        if name == "traffic light":
            if light_color == "red" and action_rank < 2:
                action_rank = 2
                action_label = "STOP (red light)"
            elif light_color == "yellow" and action_rank < 1:
                action_rank = 1
                action_label = "CAUTION (yellow light)"
        elif name in STOP_NAMES and action_rank < 2:
            action_rank = 2
            action_label = f"STOP ({name})"

    return action_rank, action_label
