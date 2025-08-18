# ----->>>>> *** Clean API server *** <<<<<-----
from fastapi import FastAPI, UploadFile, File, HTTPException
import httpx
import keras_ocr
import uvicorn
import pytesseract
from YOLO_OCR import process_complete_image_pipeline


app = FastAPI(title="Khmer Data Annotation ML") 


# full url : http://127.0.0.1:8000/images/ (receive)
@app.post("/images/")
async def process_image_and_send_to_backend(image: UploadFile = File(...), ocr_engine: str = "keras_ocr"):
    """
    API endpoint to receive an image, process it, and send results to backend.
    """
    # Read the uploaded file bytes
    image_bytes = await image.read()

    if ocr_engine != "kerasocr":
        raise HTTPException(status_code=400, detail="Invalid OCR engine. Use 'kerasocr'.")
    
    try:
        # Call the complete processing pipeline from YOLO_OCR.py
        result = process_complete_image_pipeline(image_bytes, image.filename, ocr_engine=ocr_engine)
        
        # Send results to backend automatically
        try:
            backend_url = "http://127.0.0.1:8001/api/results"        
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    backend_url,
                    json=result,
                    headers={"Content-Type": "application/json"},
                    timeout=30.0
                )
                response.raise_for_status()
                
                # Return combined response
                return {
                    "ocr_engine": ocr_engine,
                    "processing_result": result,
                    "backend_status": "success",
                    "message": "Image processed and results sent to backend successfully"
                }
                
        except httpx.RequestError:
            # If backend fails, still return processing results
            return {
                "processing_result": result,
                "backend_status": "failed",
                "message": "Image processed successfully, but failed to send to backend"
            }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except pytesseract.TesseractNotFoundError:
        raise HTTPException(status_code=500, detail="Tesseract is not installed or not in your PATH.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
