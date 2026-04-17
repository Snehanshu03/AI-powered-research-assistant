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
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


last_uploaded_file = None
app = FastAPI(
    title="AI Powered Research Assistant",
    description="Backend API for reading and querying research papers",
    version="0.1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploaded_papers"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount(
    "/uploaded_papers",
    StaticFiles(directory="uploaded_papers"),
    name="uploaded_papers"
)

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
    filename: str | None = None  # ✅ ADD THIS


@app.post("/ask-stream")
def ask_stream(request: AskRequest):

    query = request.query
    history = request.history

    query_embedding = generate_embeddings([query])[0]
    results = search_similar_chunks(query_embedding, request.filename)

    if not results:
        context = "No relevant context found."
    else:
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

    context = "\n\n".join([r["text"] for r in results]) if results else "No relevant context found."

    # =============================
    # BUILD HISTORY CONTEXT
    # =============================
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

    # =============================
    # MAIN ANSWER
    # =============================
    answer = generate_answer(query, full_context)

    # =============================
    # AI FOLLOW-UP SUGGESTIONS 🔥
    # =============================
    try:
        raw_suggestions = generate_answer(
            f"""
Given the answer below, generate 3 short follow-up questions.

Rules:
- Only questions
- No numbering
- One per line
- Keep them concise

Answer:
{answer}
"""
        )

        # Clean suggestions
        suggestions = [
            s.strip("- ").strip()
            for s in raw_suggestions.split("\n")
            if s.strip()
        ][:3]

    except Exception as e:
        print("Suggestion generation failed:", e)
        suggestions = []

    # =============================
    # FINAL RESPONSE
    # =============================
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




@app.get("/papers")
def get_papers():
    try:
        files = os.listdir(UPLOAD_DIR)

        # return only PDFs
        pdfs = [f for f in files if f.endswith(".pdf")]

        return {"papers": pdfs}

    except Exception as e:
        print("Error fetching papers:", e)
        return {"papers": []}



@app.get("/summarize/{filename}")
def summarize_paper(filename: str):
    try:
        file_path = os.path.join(UPLOAD_DIR, filename)

        if not os.path.exists(file_path):
            return {"summary": "File not found"}

        pages = extract_text_with_pages(file_path)

        text = " ".join([p["text"] for p in pages[:2]])

        if len(text.strip()) == 0:
            return {"summary": "No text found"}

        prompt = f"""
Summarize this research paper in structured format:

- Problem
- Method
- Key Results
- Conclusion

{text[:4000]}
"""

        # ✅ FIX HERE
        summary = generate_answer(
            "Summarize the paper",
            prompt
        )

        return {"summary": summary}

    except Exception as e:
        print("🔥 SUMMARY ERROR:", str(e))
        return {"summary": "Error generating summary"}