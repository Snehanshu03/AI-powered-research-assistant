import os
from chromadb import PersistentClient

# =============================
# INIT CHROMA
# =============================
CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_db")

client = PersistentClient(path=CHROMA_DB_DIR)

collection = client.get_or_create_collection(
    name="research_papers"
)


# =============================
# STORE EMBEDDINGS
# =============================
def store_embeddings(chunks, embeddings, filename):
    try:
        # Ensure embeddings are list (safety)
        if hasattr(embeddings, "tolist"):
            embeddings = embeddings.tolist()

        #  Delete existing file embeddings
        existing = collection.get(where={"source": filename}, include=[])
        existing_ids = existing.get("ids", [])

        if existing_ids:
            collection.delete(where={"source": filename})

        collection.add(
            embeddings=embeddings,  # list
            documents=[c["text"] for c in chunks],
            metadatas=[
                {
                    "source": filename,
                    "page": c["page"]
                }
                for c in chunks
            ],
            ids=[f"{filename}:{i}" for i in range(len(chunks))]
        )

    except Exception as e:
        print("Store error:", e)


# =============================
# CHECK IF FILE INDEXED
# =============================
def has_embeddings_for_file(filename):
    try:
        data = collection.get(where={"source": filename}, include=[])
        return len(data.get("ids", [])) > 0
    except Exception as e:
        print("Check embeddings error:", e)
        return False


# =============================
# SEARCH SIMILAR CHUNKS
# =============================
def search_similar_chunks(query_embedding, filename=None):
    try:
        # 🔥 Ensure query embedding is list
        if hasattr(query_embedding, "tolist"):
            query_embedding = query_embedding.tolist()

        if filename:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=5,
                where={"source": filename}
            )
        else:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=5
            )

        output = []

        if not results or not results.get("documents"):
            return []

        for i in range(len(results["documents"][0])):
            output.append({
                "text": results["documents"][0][i],
                "page": results["metadatas"][0][i]["page"],
                "filename": results["metadatas"][0][i]["source"]
            })

        return output

    except Exception as e:
        print("Search error:", e)
        return []


# =============================
# RESET COLLECTION
# =============================
def reset_collection():
    global collection
    try:
        client.delete_collection("research_papers")
    except Exception:
        pass

    collection = client.get_or_create_collection(
        name="research_papers"
    )