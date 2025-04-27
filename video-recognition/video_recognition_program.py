import cv2
import torch
import os
import warnings

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

    stop_flag = False
    action_label = "KEEP MOVING"

    for _, row in detections.iterrows():
        label = row['name']
        conf = row['confidence']
        xmin, ymin, xmax, ymax = int(row['xmin']), int(row['ymin']), int(row['xmax']), int(row['ymax'])

        # Draw bounding box and label
        cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), (0, 255, 0), 2)
        cv2.putText(frame, f"{label} {conf:.2f}", (xmin, ymin - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Decision logic
        if label in STOP_OBJECTS and conf > 0.5:
            if label == 'traffic light':
                # Simplified assumption: any detected light is red
                action_label = "STOP (traffic light)"
                stop_flag = True
            elif label in ['person', 'bicycle']:
                action_label = f"STOP ({label})"
                stop_flag = True
            elif label == 'stop sign':
                action_label = "STOP (stop sign)"
                stop_flag = True

    # Overlay action decision on frame
    cv2.putText(frame, f"ACTION: {action_label}", (30, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255) if stop_flag else (0, 255, 0), 3)

    # Write frame to output video
    out.write(frame)

cap.release()
out.release()
cv2.destroyAllWindows()
print("\n✅ Annotated video saved as 'output_dashcam_annotated.mp4'")
