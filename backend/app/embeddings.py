from sentence_transformers import SentenceTransformer
import numpy as np

# ================================
# LOAD LIGHTWEIGHT MODEL (ONCE)
# ================================
# Smaller model → better for Render free tier
_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("paraphrase-MiniLM-L3-v2")  # 🔥 lighter than L6
    return _model


# ================================
# GENERATE EMBEDDINGS
# ================================
def generate_embeddings(chunks):
    try:
        model = get_model()

        # Extract text safely
        texts = [
            c["text"] if isinstance(c, dict) else str(c)
            for c in chunks
        ]

        # Batch encode (memory safe)
        embeddings = model.encode(
            texts,
            batch_size=8,              # 🔥 keeps memory low
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True  # improves similarity search
        )

        return embeddings

    except Exception as e:
        print("Embedding Error:", e)
        return np.array([])