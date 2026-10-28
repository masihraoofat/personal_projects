# Dashcam stop and go

YOLOv5s already finds people, bicycles, stop signs, and traffic lights. A single box is not a driving decision: COCO has no light color, and one bad frame will flicker between STOP and KEEP MOVING. This project adds the color, holds the action until the same decision repeats, and scores that hold against the raw per-frame rule.

The detector is pretrained. It is not trained here.

## Pipeline

1. YOLOv5s proposes boxes on each dashcam frame.
2. A traffic-light box is cropped and labeled red, yellow, green, or unknown by counting HSV pixels. Unknown is a dim or ambiguous crop.
3. `frame_action` turns the boxes into one rank for that frame. Stop outranks caution, and caution outranks keep moving.
4. `ActionSmoother` publishes a new action only after the same rank and label appear for 3 frames in a row. The video still draws every box. `ACTION` is the held decision. `FRAME` is the raw one.
5. `score_actions.py` compares both on clips you label.

| Evidence in the frame | Raw action |
|---|---|
| Person, bicycle, or stop sign above 0.5 confidence | STOP |
| Red light above 0.5 | STOP |
| Yellow light, and nothing already says stop | CAUTION |
| Green light, unknown light, or no relevant box | KEEP MOVING |

## What the score counts

On labeled frames only:

- **False stop:** the action says stop while the clip does not.
- **Missed stop:** the clip says stop while the action does not.
- **Flip:** the action text changes from one labeled frame to the next.

`test_score_actions.py` checks a constructed 8-frame clip: one stray stop, then a real stop that lasts four frames.

| | false stops | missed stops | flips |
|---|---:|---:|---:|
| per frame | 1 | 0 | 3 |
| held (3 frames) | 0 | 2 | 1 |

The hold drops the false brake and the flicker. The two missed stops are the wait: the real stop is published on its third frame. That delay is the cost of the smoother.

The same columns for `video_input/dashcam.mp4` come from your own labels. `labels.csv` does not contain them yet.

## Run

Put the video at `video_input/dashcam.mp4`, then:

```bash
python video_recognition_program.py
```

That writes `output_dashcam_annotated.mp4` and `frame_actions.csv`. Frame 0 is the first frame. Add clips to `labels.csv`:

```
start_frame,end_frame,expected
0,40,keep
41,90,stop
```

`expected` is `keep`, `caution`, or `stop`. Then:

```bash
python score_actions.py
python -m unittest
```

## Limits worth saying out loud

- A person on the sidewalk still counts as STOP. Nothing checks whether they are in the driving path.
- A dark or glare-covered light becomes unknown, so a red lamp can be missed.
- The hold waits two extra frames before it will show a new stop.
- Yellow is caution. It is not a stop, and a caution during a `keep` clip is not counted as a false stop.
