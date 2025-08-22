import io
from PIL import Image
import numpy as np
from ultralytics import YOLO
import cv2
import pytesseract
import base64
import re
from fastapi import HTTPException

# Configure Tesseract executable path
# IMPORTANT: Make sure this path is correct for your system.
pytesseract.pytesseract.tesseract_cmd = r'D:\Pytesseract\tesseract.exe'

# Load the YOLO model once when the module is imported
import os

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "best.pt")

print(f"Script directory: {script_dir}")
print(f"Looking for model at: {model_path}")
print(f"Model exists: {os.path.exists(model_path)}")

try:
    model = YOLO(model_path)
    print(f"Successfully loaded custom model: {model_path}")
except FileNotFoundError as e:
    print(f"Error: Model file not found at {model_path}")
    print(f"Files in script directory: {os.listdir(script_dir)}")
except Exception as e:
    print(f"Error loading model: {type(e).__name__}: {e}")
    
def _preprocess_for_ocr(pil_image: Image.Image) -> Image.Image:
    """
    Preprocesses a PIL image for better OCR performance.
    Converts to grayscale, denoises, and applies thresholding.
    """
    open_cv_image = np.array(pil_image.convert('L'))
    denoised = cv2.fastNlMeansDenoising(open_cv_image, h=10, templateWindowSize=7, searchWindowSize=21)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return Image.fromarray(thresh)

def process_complete_image_pipeline(image_bytes: bytes, filename: str = "uploaded_image"):
    """
    Complete pipeline: Takes image bytes, converts to PIL, runs YOLO detection, 
    performs OCR, and returns the final results.
    """
    # Convert bytes to PIL Image
    try:
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise ValueError("Invalid image file")

    # Convert to numpy array for YOLO
    np_image = np.array(pil_image)
    
    # Run YOLO detection
    results = model(np_image)
    boxes = results[0].boxes

    detections = []

    # Check if YOLO detected any bounding boxes and if boxes.xyxy is accessible
    if len(boxes) > 0:
        # Process each detected bounding box
        for box in boxes.xyxy:
            # Get coordinates and convert to integers
            x1, y1, x2, y2 = map(int, box)
            
            # Crop the image using PIL
            cropped_pil_image = pil_image.crop((x1, y1, x2, y2))
            
            # Preprocess the cropped image for better OCR results
            preprocessed_image = _preprocess_for_ocr(cropped_pil_image)

            # *** NEW: Extract Khmer text using pytesseract ***
            # The 'lang' parameter is set to 'khm' for Khmer.
            try:
                raw = pytesseract.image_to_string(preprocessed_image, lang='khm')
                extracted_text = re.sub(r'\s+', ' ', raw).strip()
            except pytesseract.TesseractNotFoundError:
                 raise HTTPException(status_code=500, detail="Tesseract is not installed or not in your PATH.")
            except Exception as e:
                # Handle other potential pytesseract errors, e.g., language data not found
                extracted_text = f"OCR Error: {e}"


            # Convert preprocessed PIL image to bytes for JSON response
            buffered = io.BytesIO()
            preprocessed_image.save(buffered, format="PNG")
            img_bytes = buffered.getvalue()
            
            # Encode bytes to Base64 string
            img_base64 = base64.b64encode(img_bytes).decode("utf-8")
            
            # Append all information for this detection
            detections.append({
                "box_coordinates": [x1, y1, x2, y2],
                "extracted_text": extracted_text.strip(),
                "cropped_image_base64": img_base64
            })
    
    else:
        # If no boxes are detected, take the whole image as a single crop
        # Preprocess the whole image for OCR
        preprocessed_image = _preprocess_for_ocr(pil_image)

        # Run OCR on the preprocessed full image
        try:
            raw = pytesseract.image_to_string(preprocessed_image, lang='khm')
            extracted_text = re.sub(r'\s+', ' ', raw).strip()
        except pytesseract.TesseractNotFoundError:
             raise HTTPException(status_code=500, detail="Tesseract is not installed or not in your PATH.")
        except Exception as e:
            extracted_text = f"OCR Error: {e}"

        # Convert preprocessed PIL image to bytes for JSON response
        buffered = io.BytesIO()
        preprocessed_image.save(buffered, format="PNG")
        img_bytes = buffered.getvalue()
        
        # Encode bytes to Base64 string
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")
        
        # Get image dimensions for the "box"
        width, height = pil_image.size
        
        # Append the result for the whole image
        detections.append({
            "box_coordinates": [0, 0, width, height],
            "extracted_text": extracted_text.strip(),
            "cropped_image_base64": img_base64
        })


    # Return basic metadata and the list of detections
    return {
        "filename": filename,
        "size": pil_image.size,  # (width, height)
        "detections": detections
    }
