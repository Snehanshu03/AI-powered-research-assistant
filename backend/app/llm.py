from groq import Groq
import os
from dotenv import load_dotenv
import os

load_dotenv()  # 🔥 this loads .env
client = Groq(api_key=os.getenv("GROQ_API_KEY"))  # 🔥 replace this

def generate_answer_stream(query, context):
    stream = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a helpful research assistant."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"}
        ],
        stream=True  # 🔥 IMPORTANT
    )

    for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content



def generate_answer(query: str, context: str):

    prompt = f"""
You are an expert AI research assistant.

STRICT RULES:
- Answer ONLY using the provided context
- Do NOT hallucinate
- If answer not found, say "Not found in the paper"
- Be clear and structured

Context:
{context}

Question:
{query}

Answer:
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # 🔥 fast + good
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"LLM Error: {str(e)}"
    

