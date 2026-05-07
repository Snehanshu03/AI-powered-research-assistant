from sentence_transformers import SentenceTransformer
import gc

_model = None


def get_model():
    global _model

    if _model is None:
        _model = SentenceTransformer(
            "sentence-transformers/paraphrase-MiniLM-L3-v2"
        )

    return _model


def generate_embeddings(chunks):
    try:
        model = get_model()

        texts = [
            c["text"] if isinstance(c, dict) else str(c)
            for c in chunks
        ]

        embeddings = model.encode(
            texts,
            batch_size=4,   # lower RAM
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        gc.collect()

        return embeddings.tolist()

    except Exception as e:
        print("Embedding Error:", e)
        return []