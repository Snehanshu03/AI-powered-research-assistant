from chromadb import PersistentClient

# Create persistent client
client = PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="research_papers"
)


def store_embeddings(chunks, embeddings, filename):
    existing = collection.get(where={"filename": filename}, include=[])
    existing_ids = existing.get("ids", [])

    if existing_ids:
        collection.delete(where={"filename": filename})

    collection.add(
        embeddings=[e.tolist() for e in embeddings],
        documents=[c["text"] for c in chunks],
        metadatas=[
            {
                "filename": filename,   # ✅ FIXED
                "page": c["page"]
            }
            for c in chunks
        ],
        ids=[f"{filename}:{i}" for i in range(len(chunks))]
    )


def has_embeddings_for_file(filename):
    data = collection.get(where={"filename": filename}, include=[])
    return len(data.get("ids", [])) > 0


def search_similar_chunks(query_embedding, filename=None):

    try:
        if filename:
            results = collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=5,
                where={"filename": filename}
            )
        else:
            results = collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=5
            )

        output = []

        if not results or not results.get("documents"):
            return []

        for i in range(len(results["documents"][0])):
            output.append({
                "text": results["documents"][0][i],
                "page": results["metadatas"][0][i]["page"],
                "filename": results["metadatas"][0][i]["filename"]
            })

        return output

    except Exception as e:
        print("Search error:", e)
        return []



def reset_collection():
    global collection
    client.delete_collection("research_papers")

    collection = client.get_or_create_collection(
        name="research_papers"
    )
