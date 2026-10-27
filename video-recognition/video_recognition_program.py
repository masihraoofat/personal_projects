import csv

import cv2
import torch
import warnings

from action_smoother import DEFAULT_HOLD_FRAMES, ActionSmoother
from decision import frame_action
from traffic_light import classify_traffic_light

# Suppress the specific FutureWarning about torch.cuda.amp.autocast
warnings.filterwarnings('ignore', category=FutureWarning, message='.*torch.cuda.amp.autocast.*')

# Load YOLOv5 model (pretrained on COCO dataset)
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', trust_repo=True)

# Load input video
video_path = 'video_input/dashcam.mp4'
cap = cv2.VideoCapture(video_path)

# Get video properties
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

# Output video writer
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter('output_dashcam_annotated.mp4', fourcc, fps, (width, height))

frame_index = 0
# The same raw action must repeat this many frames before the overlay changes.
smoother = ActionSmoother(hold_frames=DEFAULT_HOLD_FRAMES)
action_log = open("frame_actions.csv", "w", newline="", encoding="utf-8")
action_writer = csv.writer(action_log)
action_writer.writerow(["frame", "rank", "label"])

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame)
    detections = results.pandas().xyxy[0]  # Bounding box results
    observed = []

    for _, row in detections.iterrows():
        label = row['name']
        conf = float(row['confidence'])
        xmin, ymin, xmax, ymax = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])

        light_color = None
        shown = f"{label} {conf:.2f}"
        if label == 'traffic light' and conf > 0.5:
            light_color = classify_traffic_light(frame[ymin:ymax, xmin:xmax])
            shown = f"traffic light {light_color} {conf:.2f}"

        cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)
        cv2.putText(frame, shown, (xmin, max(ymin - 10, 15)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        observed.append((label, conf, light_color))

    action_rank, action_label = frame_action(observed)
    action_writer.writerow([frame_index, action_rank, action_label])
    frame_index += 1

    # The box labels stay per frame. Only the action overlay waits for agreement.
    shown_rank, shown_label = smoother.update(action_rank, action_label)
    if shown_rank == 2:
        action_color = (0, 0, 255)
    elif shown_rank == 1:
        action_color = (0, 165, 255)
    else:
        action_color = (0, 255, 0)
    cv2.putText(frame, f"ACTION: {shown_label}", (30, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, action_color, 3)
    cv2.putText(frame, f"FRAME: {action_label}", (30, 80),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # Write frame to output video
    out.write(frame)

action_log.close()
cap.release()
out.release()
cv2.destroyAllWindows()
print("\nAnnotated video saved as 'output_dashcam_annotated.mp4'")
print("Per-frame actions saved as 'frame_actions.csv'.")
print("Label clips in labels.csv, then run score_actions.py.")
