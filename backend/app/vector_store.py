from chromadb import PersistentClient

# Create persistent client
client = PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="research_papers"
)


def store_embeddings(chunks, embeddings, filename):
    print("🔥 Storing embeddings in ChromaDB...")

    for i, chunk in enumerate(chunks):
        collection.add(
            documents=[chunk],
            embeddings=[embeddings[i].tolist()],
            ids=[f"{filename}_chunk_{i}"],
            metadatas=[{"source": filename}]
        )

    return len(chunks)



def search_similar_chunks(query_embedding, filename, top_k=3):
    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=top_k,
        where={"source": filename}   # 🔥 IMPORTANT
    )

    documents = results["documents"][0]
    ids = results["ids"][0]

    cleaned = []
    for i, doc in enumerate(documents):
        doc = doc.replace("<pad>", "").strip()

        if len(doc) > 50:
            cleaned.append({
                "id": ids[i],
                "text": doc
            })

    return cleaned




def reset_collection():
    global collection
    client.delete_collection("research_papers")

    collection = client.get_or_create_collection(
        name="research_papers"
    )