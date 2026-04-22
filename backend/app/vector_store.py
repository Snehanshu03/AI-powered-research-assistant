from chromadb import PersistentClient

# =============================
# INIT CHROMA
# =============================
client = PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="research_papers"
)

# =============================
# STORE EMBEDDINGS
# =============================
def store_embeddings(chunks, embeddings, filename):
    try:
        # 🔥 Delete existing embeddings for this file
        existing = collection.get(where={"source": filename}, include=[])
        existing_ids = existing.get("ids", [])

        if existing_ids:
            collection.delete(where={"source": filename})

        # ✅ HF embeddings are already lists → no .tolist()
        collection.add(
            embeddings=embeddings,
            documents=[c["text"] for c in chunks],
            metadatas=[
                {
                    "source": filename,   # ✅ unified key
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
        # ✅ query_embedding is already list (HF API)
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
                "filename": results["metadatas"][0][i]["source"]  # ✅ mapped back
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