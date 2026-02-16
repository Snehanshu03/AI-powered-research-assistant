from fastapi import FastAPI

app = FastAPI(
    title="AI Powered Research Assistant",
    description="Backend API for reading and querying research papers",
    version="0.1.0"
)

@app.get("/")
def root():
    return {"message": "AI Research Assistant backend is running 🚀"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
