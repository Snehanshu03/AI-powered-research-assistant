import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "phi3"


def generate_answer(query: str, context: str):
    prompt = f"""
You are an expert AI research assistant.

Use BOTH:
1. Conversation history
2. Context from the paper

to answer the question.

If the question refers to previous messages, use the conversation.

If answer not found, say:
"Not found in the paper."

Context:
{context}

Question:
{query}

Answer:
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False
            }
        )

        data = response.json()
        print("DEBUG RESPONSE:", data)

        # 🔥 safer extraction
        if "response" in data:
            return data["response"].strip()
        elif "error" in data:
            return f"LLM Error: {data['error']}"
        else:
            return "Unexpected response from LLM"

    except Exception as e:
        return f"Error connecting to LLM: {str(e)}"