# ML_backend.py
from fastapi import FastAPI, UploadFile, File, HTTPException
import httpx
from useModel import run_yolo
from useAPI import gemini_ocr

app = FastAPI(title="Khmer Data Annotation ML")

@app.post("/images/")
async def process_image(image: UploadFile = File(...)):
    image_bytes = await image.read()

    try:
        # Step 1: YOLO detection
        detections = run_yolo(image_bytes)

        # Step 2: OCR on each cropped image
        results = []
        for det in detections:
            text = gemini_ocr(det["image"])
            results.append({
                "bbox": det["bbox"],
                "text": text
            })

        output_data = {
            "filename": image.filename,
            "detections": results
        }

        # Optional: send to another backend
        backend_status = "not_sent"
        backend_url = "http://127.0.0.1:8001/api/results"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    backend_url,
                    json=output_data,
                    headers={"Content-Type": "application/json"},
                    timeout=30.0
                )
                response.raise_for_status()
                backend_status = "success"
            except httpx.RequestError:
                backend_status = "failed"

        return {
            "processing_result": output_data,
            "backend_status": backend_status,
            "message": "Image processed successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
