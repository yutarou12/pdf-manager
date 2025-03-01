from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pdf2image import convert_from_bytes
from PIL import Image
import io
import base64

app = FastAPI()

# HTML テンプレートの設定
templates = Jinja2Templates(directory="templates")

# HTML ファイルを返すエンドポイント
@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/pdf_to_image/")
async def pdf_to_image(request: Request, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are allowed.")

    try:
        pdf_bytes = await file.read()
        images = convert_from_bytes(pdf_bytes)

        # 最初のページを JPEG 画像に変換
        if images:
            img = images[0]
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            img_byte_arr.seek(0)

            # 画像データを base64 エンコード
            encoded_image = base64.b64encode(img_byte_arr.read()).decode()

            return templates.TemplateResponse("index.html", {"request": request, "image": encoded_image})
        else:
            raise HTTPException(status_code=500, detail="Failed to convert PDF to image.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")