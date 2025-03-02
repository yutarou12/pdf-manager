import base64
import os

import PyPDF2
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pdf2image import convert_from_bytes
import io

app = FastAPI()
app.mount(path="/static", app=StaticFiles(directory="static"), name="static")
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

            # 元のファイル名を取得
            original_filename, _ = os.path.splitext(file.filename)
            convert_filename = f"{original_filename}.jpg"

            # ファイル名とファイルデータをJSON形式で返す
            return JSONResponse({
                "filename": convert_filename,
                "file_data": base64.b64encode(img_byte_arr.getvalue()).decode()
            })
        else:
            raise HTTPException(status_code=500, detail="Failed to convert PDF to image.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/compress_pdf/")
async def compress_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are allowed.")

    try:
        pdf_bytes = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        pdf_writer = PyPDF2.PdfWriter()

        for page in pdf_reader.pages:
            pdf_writer.add_page(page)

        compressed_pdf_bytes = io.BytesIO()
        pdf_writer.write(compressed_pdf_bytes)
        compressed_pdf_bytes.seek(0)

        # 元のファイル名を取得
        original_filename, _ = os.path.splitext(file.filename)
        compressed_filename = f"{original_filename}_compressed.pdf"

        # ファイル名とファイルデータをJSON形式で返す
        return JSONResponse({
            "filename": compressed_filename,
            "file_data": base64.b64encode(compressed_pdf_bytes.getvalue()).decode()
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")