
from sentence_transformers import SentenceTransformer
import gc

_model = None


# =============================
# LOAD MODEL ONLY ONCE
# =============================
def get_model():
    global _model

    if _model is None:
        _model = SentenceTransformer(
            "sentence-transformers/paraphrase-MiniLM-L3-v2",
            device="cpu"
        )

    return _model


# =============================
# GENERATE EMBEDDINGS
# MEMORY OPTIMIZED
# =============================
def generate_embeddings(chunks):

    try:
        model = get_model()

        texts = [
            c["text"] if isinstance(c, dict) else str(c)
            for c in chunks
        ]

        all_embeddings = []

        # 🔥 SMALL BATCHES
        BATCH_SIZE = 8

        for i in range(0, len(texts), BATCH_SIZE):

            batch = texts[i:i + BATCH_SIZE]

            embeddings = model.encode(
                batch,
                batch_size=4,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=True
            )

            all_embeddings.extend(embeddings.tolist())

            # 🔥 FREE MEMORY
            del embeddings
            gc.collect()

        gc.collect()

        return all_embeddings

    except Exception as e:
        print("Embedding Error:", e)
        gc.collect()
        return []
