
import os
import requests
import gc

HF_TOKEN = os.getenv("HF_TOKEN")

API_URL = (
    "https://api-inference.huggingface.co/models/"
    "sentence-transformers/all-MiniLM-L6-v2"
)

headers = {
    "Authorization": f"Bearer {HF_TOKEN}"
}


# =============================
# GENERATE EMBEDDINGS
# =============================
def generate_embeddings(chunks):

    embeddings = []

    try:
        for chunk in chunks:

            text = (
                chunk["text"]
                if isinstance(chunk, dict)
                else str(chunk)
            )

            if not text.strip():
                continue

            response = requests.post(
                API_URL,
                headers=headers,
                json={
                    "inputs": text,
                    "options": {
                        "wait_for_model": True
                    }
                },
                timeout=60
            )

            if response.status_code != 200:
                print("HF API Error:", response.text)
                continue

            result = response.json()

            # flatten embedding
            if isinstance(result, list) and len(result) > 0:
                if isinstance(result[0], list):
                    result = result[0]

                embeddings.append(result)

        gc.collect()

        return embeddings

    except Exception as e:
        print("Embedding Error:", e)
        gc.collect()
        return []

