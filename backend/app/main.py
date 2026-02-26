from fastapi import FastAPI, UploadFile, File
import shutil
import os
from fastapi.responses import StreamingResponse
from .pdf_parser import extract_text_from_pdf
from .chunker import chunk_text
from .embeddings import generate_embeddings
from .vector_store import store_embeddings
from .vector_store import search_similar_chunks
from .llm import generate_answer, generate_answer_stream
from .vector_store import reset_collection
from pydantic import BaseModel
from .pdf_parser import extract_text_with_pages




last_uploaded_file = None
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
def upload_pdf(file: UploadFile = File(...)):
    global last_uploaded_file

    # 🔥 RESET DATABASE
    reset_collection()

    file_path = f"uploaded_papers/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    pages = extract_text_with_pages(file_path)
    chunks = chunk_text(pages)
    embeddings = generate_embeddings(chunks)

    store_embeddings(chunks, embeddings, file.filename)

    last_uploaded_file = file.filename

    return {"message": "PDF processed successfully"}


class AskRequest(BaseModel):
    query: str
    history: list = []



@app.post("/ask-stream")
def ask_stream(request: AskRequest):

    query = request.query
    history = request.history

    query_embedding = generate_embeddings([query])[0]
    results = search_similar_chunks(query_embedding, last_uploaded_file)

    context = "\n\n".join([r["text"] for r in results])

    def stream_generator():
        for token in generate_answer_stream(query, context):
            yield token

    return StreamingResponse(stream_generator(), media_type="text/plain")


@app.post("/ask")
def ask(request: AskRequest):
    query = request.query
    history = request.history

    query_embedding = generate_embeddings([query])[0]
    results = search_similar_chunks(query_embedding, last_uploaded_file)

    context = "\n\n".join([r["text"] for r in results])

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

    return {
    "answer": answer,
    "sources": [
        {
            "text": r["text"][:300],
            "page": r["page"]
        }
        for r in results
    ]
}


