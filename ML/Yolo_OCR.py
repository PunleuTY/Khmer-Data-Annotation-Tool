import io
import os
import base64
import re
from fastapi import HTTPException
from PIL import Image
import numpy as np
from ultralytics import YOLO
import google.generativeai as genai
import pytesseract
from dotenv import load_dotenv

# --- SETUP ---

# 1. Load environment variables from the .env file
load_dotenv()

# 2. Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found. Please create a .env file and add your key.")
genai.configure(api_key=api_key)

# 3. Load the Gemini Model
try:
    gemini_model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("✅ Successfully loaded Gemini 1.5 Flash model.")
except Exception as e:
    print(f"❌ Error loading Gemini model: {e}")
    gemini_model = None

# 4. Load the YOLO model
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "best.pt")
try:
    yolo_model = YOLO(model_path)
    print(f"✅ Successfully loaded custom YOLO model: {model_path}")
except Exception as e:
    raise RuntimeError(f"Failed to load YOLO model at {model_path}: {e}")

# --- PROCESSING FUNCTION ---

def process_image_with_gemini(image_bytes: bytes, filename: str = "uploaded_image", ocr_engine: str = "gemini"):
    """
    Pipeline using YOLO for detection and OCR (Gemini or Tesseract).
    ocr_engine: "gemini" (default) | "tesseract"
    """
    try:
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise ValueError("Invalid image file provided.")

    np_image = np.array(pil_image)

    # Run YOLO detection
    results = yolo_model(np_image)
    boxes = results[0].boxes

    detections = []

    def run_ocr(crop_img: Image.Image) -> str:
        """Run OCR using selected engine."""
        if ocr_engine == "gemini":
            if not gemini_model:
                raise HTTPException(status_code=500, detail="Gemini model not available.")
            prompt = "Extract the Khmer text from this image."
            response = gemini_model.generate_content([prompt, crop_img], stream=False)
            return re.sub(r'\s+', ' ', response.text).strip() or "No text found"
        elif ocr_engine == "tesseract":
            return pytesseract.image_to_string(crop_img, lang="khm").strip() or "No text found"
        else:
            raise HTTPException(status_code=400, detail=f"OCR engine '{ocr_engine}' not supported.")

    if len(boxes) > 0:
        # Loop through each box detected by YOLO
        for box in boxes.xyxy:
            x1, y1, x2, y2 = map(int, box)

            cropped_pil_image = pil_image.crop((x1, y1, x2, y2))

            try:
                extracted_text = run_ocr(cropped_pil_image)
            except Exception as e:
                print(f"OCR error: {e}")
                extracted_text = f"OCR Error: {e}"

            # Convert cropped image to Base64
            buffered = io.BytesIO()
            cropped_pil_image.save(buffered, format="PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

            detections.append({
                "box_coordinates": [x1, y1, x2, y2],
                "extracted_text": extracted_text,
                "cropped_image_base64": img_base64
            })
    else:
        # Fallback: run OCR on full image
        print("⚠️ No boxes detected by YOLO. Running OCR on the full image.")
        try:
            extracted_text = run_ocr(pil_image)
        except Exception as e:
            extracted_text = f"OCR Error: {e}"

        buffered = io.BytesIO()
        pil_image.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

        width, height = pil_image.size
        detections.append({
            "box_coordinates": [0, 0, width, height],
            "extracted_text": extracted_text,
            "cropped_image_base64": img_base64
        })

    return {
        "filename": filename,
        "size": pil_image.size,
        "detections": detections
    }
