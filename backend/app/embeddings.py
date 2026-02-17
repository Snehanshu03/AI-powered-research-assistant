from sentence_transformers import SentenceTransformer

# Load model once (important)
model = SentenceTransformer("all-MiniLM-L6-v2")


def generate_embeddings(chunks: list[str]):
    """
    Convert list of text chunks into vector embeddings.
    """
    embeddings = model.encode(chunks)
    return embeddings
