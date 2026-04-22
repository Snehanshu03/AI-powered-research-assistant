import requests
import os

HF_TOKEN = os.getenv("HF_TOKEN")

API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"

headers = {
    "Authorization": f"Bearer {HF_TOKEN}"
}

def generate_embeddings(chunks):
    embeddings = []

    for chunk in chunks:
        text = chunk["text"] if isinstance(chunk, dict) else chunk

        response = requests.post(
            API_URL,
            headers=headers,
            json={"inputs": text}
        )

        if response.status_code != 200:
            raise Exception(f"HF API Error: {response.text}")

        emb = response.json()

        # flatten (important)
        if isinstance(emb[0], list):
            emb = emb[0]

        embeddings.append(emb)

    return embeddings