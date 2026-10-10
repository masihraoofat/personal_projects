import cv2
import torch
import warnings

from action_smoother import ActionSmoother
from traffic_light import classify_traffic_light

# Suppress the specific FutureWarning about torch.cuda.amp.autocast
warnings.filterwarnings('ignore', category=FutureWarning, message='.*torch.cuda.amp.autocast.*')

# Load YOLOv5 model (pretrained on COCO dataset)
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', trust_repo=True)

# Define important classes for decision-making
STOP_OBJECTS = ['stop sign', 'person', 'bicycle', 'traffic light']

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

frame_count = 0
# The same raw action must repeat this many frames before the overlay changes.
HOLD_FRAMES = 3
smoother = ActionSmoother(hold_frames=HOLD_FRAMES)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    results = model(frame)
    detections = results.pandas().xyxy[0]  # Bounding box results

    # 0 = keep moving, 1 = caution, 2 = stop. A weaker action cannot replace a stronger one.
    action_rank = 0
    action_label = "KEEP MOVING"

    for _, row in detections.iterrows():
        label = row['name']
        conf = row['confidence']
        xmin, ymin, xmax, ymax = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])

        shown = f"{label} {conf:.2f}"
        if label == 'traffic light' and conf > 0.5:
            color = classify_traffic_light(frame[ymin:ymax, xmin:xmax])
            shown = f"traffic light {color} {conf:.2f}"
            if color == 'red' and action_rank < 2:
                action_rank = 2
                action_label = "STOP (red light)"
            elif color == 'yellow' and action_rank < 1:
                action_rank = 1
                action_label = "CAUTION (yellow light)"

        cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)
        cv2.putText(frame, shown, (xmin, max(ymin - 10, 15)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        if label in STOP_OBJECTS and label != 'traffic light' and conf > 0.5 and action_rank < 2:
            action_rank = 2
            action_label = f"STOP ({label})"

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

cap.release()
out.release()
cv2.destroyAllWindows()
print("\n✅ Annotated video saved as 'output_dashcam_annotated.mp4'")
