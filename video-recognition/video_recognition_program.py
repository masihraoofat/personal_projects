import cv2
import torch
import warnings

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

    # Overlay action decision on frame
    if action_rank == 2:
        action_color = (0, 0, 255)
    elif action_rank == 1:
        action_color = (0, 165, 255)
    else:
        action_color = (0, 255, 0)
    cv2.putText(frame, f"ACTION: {action_label}", (30, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, action_color, 3)

    # Write frame to output video
    out.write(frame)

cap.release()
out.release()
cv2.destroyAllWindows()
print("\n✅ Annotated video saved as 'output_dashcam_annotated.mp4'")
