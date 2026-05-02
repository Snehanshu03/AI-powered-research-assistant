from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import shutil
import os

from app.pdf_parser import extract_text_with_pages
from app.chunker import chunk_text
from app.embeddings import generate_embeddings
from app.vector_store import (
    store_embeddings,
    search_similar_chunks,
    has_embeddings_for_file,
    collection,
)
from app.llm import generate_answer, generate_answer_stream


# =============================
# APP INIT
# =============================
app = FastAPI(
    title="AI Powered Research Assistant",
    version="0.1.0"
)

# =============================
# CORS
# =============================

# Allow both deployed and local origins
origins = [
    "https://ai-powered-research-assistant-chi.vercel.app",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "").strip() or None,  # From env
]
origins = [o for o in origins if o]  # Remove None values

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # ⚠️ IMPORTANT
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# =============================
# FILE STORAGE
# =============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.getenv(
    "UPLOAD_DIR",
    os.path.join(BASE_DIR, "..", "uploaded_papers")
)

os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount(
    "/uploaded_papers",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploaded_papers"
)

# =============================
# ROOT
# =============================
@app.get("/")
def root():
    return {"message": "AI Research Assistant backend is running 🚀"}


@app.get("/health")
def health():
    return {"status": "ok"}


# =============================
# ENSURE INDEXED
# =============================
def ensure_file_indexed(filename: str | None):
    if not filename:
        return

    if has_embeddings_for_file(filename):
        return

    file_path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        return

    pages = extract_text_with_pages(file_path)
    chunks = chunk_text(pages)

    if not chunks:
        return

    embeddings = generate_embeddings(chunks)
    store_embeddings(chunks, embeddings, filename)


# =============================
# UPLOAD
# =============================
@app.post("/upload")
def upload_pdf(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pages = extract_text_with_pages(file_path)
    chunks = chunk_text(pages)
    embeddings = generate_embeddings(chunks)

    store_embeddings(chunks, embeddings, file.filename)

    return {"message": "PDF processed successfully"}


# =============================
# REQUEST MODEL
# =============================
class AskRequest(BaseModel):
    query: str
    history: list = []
    filename: str | None = None


# =============================
# STREAMING CHAT
# =============================
@app.post("/ask-stream")
def ask_stream(request: AskRequest):

    query = request.query
    history = request.history
    filename = request.filename

    ensure_file_indexed(filename)

    query_embedding = generate_embeddings([query])[0]
    results = search_similar_chunks(query_embedding, filename)

    context = "\n\n".join([r["text"] for r in results]) if results else ""

    history_text = ""
    for msg in history:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_text += f"{role}: {msg['content']}\n"

    full_context = f"""
Conversation:
{history_text}

Context:
{context}
"""

    def stream_generator():
        for token in generate_answer_stream(query, full_context):
            yield token

    return StreamingResponse(stream_generator(), media_type="text/plain")


# =============================
# NORMAL CHAT
# =============================
@app.post("/ask")
def ask(request: AskRequest):

    query = request.query
    history = request.history
    filename = request.filename

    ensure_file_indexed(filename)

    query_embedding = generate_embeddings([query])[0]
    results = search_similar_chunks(query_embedding, filename)

    context = "\n\n".join([r["text"] for r in results]) if results else ""

    history_text = ""
    for msg in history:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_text += f"{role}: {msg['content']}\n"

    full_context = f"""
Conversation:
{history_text}

Context:
{context}
"""

    answer = generate_answer(query, full_context)

    # suggestions
    try:
        raw = generate_answer(
            "Generate 3 short follow-up questions",
            answer
        )

        suggestions = [
            s.strip("- ").strip()
            for s in raw.split("\n")
            if s.strip()
        ][:3]

    except Exception:
        suggestions = []

    return {
        "answer": answer,
        "sources": [
            {
                "text": r["text"][:300],
                "page": r["page"],
                "filename": r.get("filename", "")
            }
            for r in results
        ],
        "suggestions": suggestions
    }


# =============================
# LIST PAPERS
# =============================
@app.get("/papers")
def get_papers():
    try:
        files = os.listdir(UPLOAD_DIR)
        pdfs = [f for f in files if f.endswith(".pdf")]
        return {"papers": pdfs}
    except Exception as e:
        print("Error fetching papers:", e)
        return {"papers": []}


# =============================
# SUMMARY
# =============================
@app.get("/summarize/{filename}")
def summarize_paper(filename: str):
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)

        if not os.path.exists(file_path):
            return {"summary": "File not found"}

        pages = extract_text_with_pages(file_path)
        text = " ".join([p["text"] for p in pages[:2]])

        if not text.strip():
            return {"summary": "No text found"}

        summary = generate_answer(
            "Summarize the paper",
            text[:4000]
        )

        return {"summary": summary}

    except Exception as e:
        print("SUMMARY ERROR:", str(e))
        return {"summary": "Error generating summary"}


# =============================
# DELETE FILE (FIXED)
# =============================
@app.delete("/delete/{filename}")
def delete_file(filename: str):

    file_path = os.path.join(UPLOAD_DIR, filename)

    if os.path.exists(file_path):
        os.remove(file_path)

    try:
        # 🔥 FIXED KEY
        collection.delete(where={"source": filename})
    except Exception as e:
        print("Vector delete error:", e)

    return {"message": f"{filename} deleted"}


