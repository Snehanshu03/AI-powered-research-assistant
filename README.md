# AI-Powered Research Assistant

An open-source research assistant for uploading, reading, searching, summarizing, and asking questions about PDF research papers. The application combines a FastAPI backend, a Next.js frontend, local sentence-transformer embeddings, ChromaDB vector search, and Groq-hosted LLM responses to provide a practical retrieval-augmented generation (RAG) workflow for academic papers.

## Features

- Upload and view PDF research papers in the browser.
- Automatically extract text from PDFs with page-level metadata.
- Split papers into overlapping chunks for retrieval.
- Generate CPU-based embeddings with `sentence-transformers/paraphrase-MiniLM-L3-v2`.
- Store and query embeddings in a persistent ChromaDB collection.
- Ask questions against the current paper or across all indexed papers.
- Stream answers from Groq using `llama-3.1-8b-instant`.
- Show source snippets with filename and page number.
- Navigate from answer sources back to the relevant PDF page.
- Generate short paper summaries.
- Delete uploaded papers and their associated vector records.

## Architecture

```text
Frontend (Next.js)
  - PDF upload and viewer
  - Chat interface
  - Summary tab
  - Source navigation

Backend (FastAPI)
  - PDF storage and static serving
  - Text extraction with PyMuPDF
  - Chunking and embedding pipeline
  - ChromaDB vector store
  - Groq LLM answer generation
```

### RAG Flow

1. A user uploads a PDF from the frontend.
2. The backend stores the PDF in `uploaded_papers/`.
3. A background thread extracts text from the PDF using PyMuPDF.
4. Extracted text is cleaned, truncated to the configured page limit, and split into overlapping chunks.
5. Each chunk is embedded with SentenceTransformers.
6. Embeddings, chunk text, source filename, and page metadata are persisted in ChromaDB.
7. When a user asks a question, the backend embeds the query and retrieves the most relevant chunks.
8. The retrieved context and conversation history are sent to Groq.
9. The answer is streamed back to the frontend and source references are displayed.

## Tech Stack

### Backend

- FastAPI
- Uvicorn
- Groq Python SDK
- SentenceTransformers
- ChromaDB
- PyMuPDF
- Pydantic
- python-dotenv

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- react-pdf
- pdfjs-dist
- react-markdown
- remark-gfm

## Repository Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- main.py          # FastAPI routes and orchestration
|   |   |-- pdf_parser.py    # PDF text extraction and cleaning
|   |   |-- chunker.py       # Text chunking
|   |   |-- embeddings.py    # SentenceTransformer embedding generation
|   |   |-- vector_store.py  # ChromaDB persistence and retrieval
|   |   `-- llm.py           # Groq LLM calls
|   |-- Dockerfile
|   |-- requirements.txt
|   `-- runtime.txt
|-- frontend/
|   |-- app/
|   |   |-- page.tsx
|   |   `-- components/
|   |       |-- Sidebar.tsx
|   |       |-- PDFViewer.tsx
|   |       `-- ChatPanel.tsx
|   |-- package.json
|   `-- public/
|-- chroma_db/          # Local ChromaDB persistence directory
|-- uploaded_papers/    # Uploaded PDF files
|-- render.yaml         # Render deployment configuration for backend
`-- README.md
```

## Prerequisites

- Python 3.10+
- Node.js 20+
- npm
- A Groq API key

## Environment Variables

Create a `.env` file for the backend environment:

```env
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=../uploaded_papers
CHROMA_DB_DIR=../chroma_db
```

Create a frontend environment file at `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Required Variables

| Variable | Used By | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | Backend | API key used by the Groq SDK. |
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL for the FastAPI backend. |

### Optional Variables

| Variable | Used By | Default | Description |
| --- | --- | --- | --- |
| `FRONTEND_URL` | Backend | None | Additional CORS origin for deployed frontend. |
| `UPLOAD_DIR` | Backend | `backend/../uploaded_papers` | Directory used to store uploaded PDFs. |
| `CHROMA_DB_DIR` | Backend | `./chroma_db` | Directory used by ChromaDB persistence. |

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-powered-research-assistant
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Create the backend `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:3000
```

Start the API server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

FastAPI interactive docs:

```text
http://localhost:8000/docs
```

### 3. Set Up the Frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the Next.js development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

## Usage

### Upload a Paper

1. Open the frontend at `http://localhost:3000`.
2. Click `Choose File` or drag and drop a PDF into the viewer.
3. The backend saves the PDF and starts indexing it in the background.
4. Click `Refresh` in the sidebar if the uploaded paper does not appear immediately.

### Ask Questions About the Current Paper

1. Select a paper from the sidebar.
2. Keep the chat mode set to `Current`.
3. Ask a question such as:

```text
What is the main contribution of this paper?
```

The assistant retrieves relevant chunks from the selected PDF and generates an answer using only the retrieved context.

### Ask Questions Across All Papers

1. Select `All` in the chat panel.
2. Ask a cross-document question such as:

```text
Which papers discuss transformer-based retrieval methods?
```

The backend searches the full ChromaDB collection instead of filtering by a single filename.

### View Sources

After a response is generated, source cards appear below the assistant message. Click a source to jump to the cited page in the PDF viewer.

### Summarize a Paper

1. Select a paper from the sidebar.
2. Open the `Summary` tab in the chat panel.
3. The frontend calls the backend summary endpoint and displays a generated summary.

## API Reference

### Health Check

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

### Upload PDF

```http
POST /upload
Content-Type: multipart/form-data
```

Form field:

| Field | Type | Description |
| --- | --- | --- |
| `file` | PDF file | Paper to upload and index. |

Example:

```bash
curl -X POST http://localhost:8000/upload ^
  -F "file=@paper.pdf"
```

Response:

```json
{
  "message": "PDF uploaded successfully",
  "filename": "paper.pdf"
}
```

### Ask a Question

```http
POST /ask
Content-Type: application/json
```

Request:

```json
{
  "query": "What problem does this paper solve?",
  "history": [],
  "filename": "paper.pdf"
}
```

Response:

```json
{
  "answer": "The paper addresses ...",
  "sources": [
    {
      "text": "Relevant source snippet...",
      "page": 3,
      "filename": "paper.pdf"
    }
  ],
  "suggestions": [
    "What method does the paper use?",
    "What datasets are evaluated?",
    "What are the limitations?"
  ]
}
```

Set `filename` to `null` to search across all indexed papers.

### Stream an Answer

```http
POST /ask-stream
Content-Type: application/json
```

Request:

```json
{
  "query": "Summarize the methodology.",
  "history": [],
  "filename": "paper.pdf"
}
```

Response:

```text
Plain-text token stream
```

### List Uploaded Papers

```http
GET /papers
```

Response:

```json
{
  "papers": ["paper.pdf"]
}
```

### Summarize a Paper

```http
GET /summarize/{filename}
```

Example:

```bash
curl http://localhost:8000/summarize/paper.pdf
```

Response:

```json
{
  "summary": "This paper presents ..."
}
```

### Delete a Paper

```http
DELETE /delete/{filename}
```

This removes the PDF from disk and deletes its associated ChromaDB vectors.

Response:

```json
{
  "message": "paper.pdf deleted"
}
```

## Implementation Notes

- PDF processing is limited to the first 80 pages in `backend/app/pdf_parser.py` to reduce memory pressure in cloud environments.
- The chunker uses 1,200-word chunks with a 150-word overlap.
- The vector store retrieves the top 3 most similar chunks for each query.
- The backend lazily re-indexes a selected file if it exists on disk but has no stored embeddings.
- The LLM prompt instructs the model to answer only from retrieved context and return `Not found in the paper` when the answer is unavailable.
- Uploaded PDFs are served through FastAPI at `/uploaded_papers/{filename}`.

## Deployment

### Backend on Render

The repository includes `render.yaml` for deploying the backend as a Dockerized Render web service:

```yaml
services:
  - type: web
    name: ai-powered-research-assistant-backend
    runtime: docker
    rootDir: backend
    plan: free
    healthCheckPath: /health
```

Set the following environment variables in Render:

```env
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=https://your-frontend-domain.com
```

The backend Dockerfile starts Uvicorn on Render's configured `PORT`.

### Frontend on Vercel

Deploy the `frontend/` directory to Vercel and set:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

Also ensure the deployed frontend URL is included in the backend CORS configuration through `FRONTEND_URL`.

## Development Commands

### Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm run dev
```

### Frontend Build

```bash
cd frontend
npm run build
```

### Frontend Lint

```bash
cd frontend
npm run lint
```

## Security Notes

- Do not commit `.env` files or API keys.
- Rotate any API key that has been exposed in source control or shared environments.
- Uploaded files are stored on disk and served publicly by the backend static route. Add authentication and authorization before using this with private or sensitive documents.
- The current upload route accepts client-provided filenames. For production, sanitize filenames and consider generating server-side unique file IDs.

## License

This project is licensed under the terms of the repository license file.
