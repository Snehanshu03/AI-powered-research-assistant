import streamlit as st
import requests

BACKEND_URL = "http://127.0.0.1:8000"

st.set_page_config(page_title="AI Research Assistant", layout="wide")

st.title("🧠 AI Research Assistant")

# 🧠 Session state for chat
if "messages" not in st.session_state:
    st.session_state.messages = []

# 📄 Upload PDF
uploaded_file = st.file_uploader("Upload PDF", type=["pdf"])

if uploaded_file:
    st.success("File uploaded!")
    st.info(f"Current Paper: {uploaded_file.name}")

    files = {"file": uploaded_file.getvalue()}
    response = requests.post(f"{BACKEND_URL}/upload", files=files)

    if response.status_code == 200:
        st.success("PDF processed successfully!")
    else:
        st.error("Error uploading PDF")

# 💬 Chat UI
# 🧠 Initialize session state
# 💬 Chat UI
st.subheader("💬 Chat")

# 🔁 Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 📝 Input
query = st.chat_input("Ask something about the paper...")

if query:
    # 👤 Save user message
    st.session_state.messages.append({
        "role": "user",
        "content": query
    })

    with st.chat_message("user"):
        st.markdown(query)

    # 🤖 Get response
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):

            response = requests.post(
                f"{BACKEND_URL}/ask",
                json={
                    "query": query,
                    "history": st.session_state.messages
                }
            )

            if response.status_code == 200:
                data = response.json()
                answer = data["answer"]

                # ✅ Combine answer + sources
                full_answer = answer + "\n\n**Sources:**\n" + "\n".join(data["sources"])

                # ✅ Show full answer
                st.markdown(full_answer)

                # ✅ Save full answer (IMPORTANT)
                st.session_state.messages.append({
                    "role": "assistant",
                    "content": full_answer
                })

            else:
                st.error("Error getting response")