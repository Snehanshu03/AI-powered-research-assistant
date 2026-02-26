from chromadb import PersistentClient

# Create persistent client
client = PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="research_papers"
)


def store_embeddings(chunks, embeddings, filename):
    collection.add(
        embeddings=[e.tolist() for e in embeddings],
        documents=[c["text"] for c in chunks],
        metadatas=[
            {
                "source": filename,
                "page": c["page"]   # 🔥 ADD PAGE
            }
            for c in chunks
        ],
        ids=[str(i) for i in range(len(chunks))]
    )



def search_similar_chunks(query_embedding, filename):
    results = collection.query(
    query_embeddings=[query_embedding.tolist()],
    n_results=3,
    where={"source": filename}  # 🔥 IMPORTANT
)

    output = []
    for i in range(len(results["documents"][0])):
        output.append({
            "text": results["documents"][0][i],
            "page": results["metadatas"][0][i]["page"]
        })

    return output




def reset_collection():
    global collection
    client.delete_collection("research_papers")

    collection = client.get_or_create_collection(
        name="research_papers"
    )