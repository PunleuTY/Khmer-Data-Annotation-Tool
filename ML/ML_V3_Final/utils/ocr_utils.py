import io, base64, re, numpy as np, cv2
from PIL import Image
import pytesseract
import os

# ---- Configure Tesseract ----
pytesseract.pytesseract.tesseract_cmd = r"/opt/homebrew/bin/tesseract"
os.environ["TESSDATA_PREFIX"] = r"/opt/homebrew/share/tessdata"

def preprocess_for_ocr(pil_image):
    gray = np.array(pil_image.convert("L"))
    denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return Image.fromarray(thresh)

def process_user_boxes(image_bytes, boxes):
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    detections = []

    for box in boxes:
        if not (isinstance(box, list) and len(box) == 4):
            continue
        x1, y1, x2, y2 = map(int, box)
        cropped = pil_image.crop((x1, y1, x2, y2))
        preprocessed = preprocess_for_ocr(cropped)
        try:
            text = re.sub(r"\s+", " ", pytesseract.image_to_string(preprocessed, lang="khm")).strip()
        except Exception:
            text = ""

        buffer = io.BytesIO()
        preprocessed.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        detections.append({
            "box_coordinates": [x1, y1, x2, y2],
            "extracted_text": text,
            "cropped_image_base64": img_base64
        })
    return detections
