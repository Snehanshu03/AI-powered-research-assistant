from chromadb import PersistentClient

# Create persistent client
client = PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="research_papers"
)


def store_embeddings(chunks, embeddings):
    print("🔥 Storing embeddings in ChromaDB...")

    for i, chunk in enumerate(chunks):
        collection.add(
            documents=[chunk],
            embeddings=[embeddings[i].tolist()],
            ids=[f"chunk_{i}"]
        )

    return len(chunks)
