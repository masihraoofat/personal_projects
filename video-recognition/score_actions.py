"""Compare the per-frame action with the held action on labeled clips.

labels.csv rows are start_frame,end_frame,expected. Frame 0 is the first
frame of the video. expected is keep, caution, or stop. frame_actions.csv
is written by video_recognition_program.py.

False stop: the action says stop while the label does not.
Missed stop: the label says stop while the action does not.
Flip: the action text changes between two labeled frames in a row.
"""

import csv
import sys

from action_smoother import DEFAULT_HOLD_FRAMES, ActionSmoother

EXPECTED = ("keep", "caution", "stop")


def load_actions(path):
    actions = []
    with open(path, newline="", encoding="utf-8") as handle:
        for index, row in enumerate(csv.DictReader(handle)):
            frame = int(row["frame"])
            if frame != index:
                raise ValueError(f"{path} skips or repeats frame {frame}")
            actions.append((int(row["rank"]), row["label"]))
    return actions


def load_labels(path, frame_count):
    expected = [None] * frame_count
    labeled = set()
    clips = 0
    with open(path, newline="", encoding="utf-8") as handle:
        for row in csv.DictReader(handle):
            start = int(row["start_frame"])
            end = int(row["end_frame"])
            label = row["expected"].strip().lower()
            if label not in EXPECTED:
                raise ValueError(f"expected must be keep, caution, or stop, not {label!r}")
            if start < 0 or start > end or end >= frame_count:
                raise ValueError(f"clip {start}-{end} is outside frames 0-{frame_count - 1}")
            for frame in range(start, end + 1):
                if frame in labeled:
                    raise ValueError(f"frame {frame} is labeled more than once")
                labeled.add(frame)
                expected[frame] = label
            clips += 1
    return expected, clips


def _counts(actions, expected):
    false_stops = 0
    missed_stops = 0
    labeled_frames = 0
    flips = 0
    previous = None
    for (rank, label), truth in zip(actions, expected):
        if truth is None:
            previous = None
            continue
        labeled_frames += 1
        if previous is not None and label != previous:
            flips += 1
        previous = label
        if rank == 2 and truth != "stop":
            false_stops += 1
        if truth == "stop" and rank != 2:
            missed_stops += 1
    return {
        "false_stops": false_stops,
        "missed_stops": missed_stops,
        "flips": flips,
        "labeled_frames": labeled_frames,
    }


def score(actions, expected, hold_frames=DEFAULT_HOLD_FRAMES):
    smoother = ActionSmoother(hold_frames=hold_frames)
    held = [smoother.update(rank, label) for rank, label in actions]
    per_frame = _counts(actions, expected)
    smoothed = _counts(held, expected)
    return {
        "hold_frames": hold_frames,
        "labeled_frames": per_frame["labeled_frames"],
        "per_frame": per_frame,
        "held": smoothed,
    }


def format_report(report):
    per_frame = report["per_frame"]
    held = report["held"]
    name_width = 18
    header = f"{'':<{name_width}} {'false stops':>12} {'missed stops':>13} {'flips':>6}"
    raw_row = (
        f"{'per frame':<{name_width}} {per_frame['false_stops']:>12} "
        f"{per_frame['missed_stops']:>13} {per_frame['flips']:>6}"
    )
    held_name = f"held ({report['hold_frames']} frames)"
    held_row = (
        f"{held_name:<{name_width}} {held['false_stops']:>12} "
        f"{held['missed_stops']:>13} {held['flips']:>6}"
    )
    return "\n".join([
        f"labeled frames: {report['labeled_frames']}",
        header,
        raw_row,
        held_row,
    ])


def main():
    actions_path = "frame_actions.csv"
    labels_path = "labels.csv"
    try:
        actions = load_actions(actions_path)
    except FileNotFoundError:
        print("Run video_recognition_program.py first. It writes frame_actions.csv.")
        return 1
    if not actions:
        print("frame_actions.csv has no frames.")
        return 1
    try:
        expected, clips = load_labels(labels_path, len(actions))
    except FileNotFoundError:
        print("Add labels.csv with columns start_frame,end_frame,expected.")
        return 1
    if clips == 0:
        print("labels.csv has no clips yet. Frame 0 is the first frame.")
        print("expected is keep, caution, or stop. Example:")
        print("start_frame,end_frame,expected")
        print("0,40,keep")
        print("41,90,stop")
        return 1
    print(format_report(score(actions, expected)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
