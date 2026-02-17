from fastapi import FastAPI, UploadFile, File
import shutil
import os

from .pdf_parser import extract_text_from_pdf
from .chunker import chunk_text
from .embeddings import generate_embeddings
from .vector_store import store_embeddings



app = FastAPI(
    title="AI Powered Research Assistant",
    description="Backend API for reading and querying research papers",
    version="0.1.0"
)

UPLOAD_DIR = "uploaded_papers"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {"message": "AI Research Assistant backend is running 🚀"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text_from_pdf(file_path)

    chunks = chunk_text(extracted_text)

    embeddings = generate_embeddings(chunks)

    stored_count = store_embeddings(chunks, embeddings)

    return {
        "filename": file.filename,
        "characters_extracted": len(extracted_text),
        "number_of_chunks": len(chunks),
        "stored_in_vector_db": stored_count
    }

