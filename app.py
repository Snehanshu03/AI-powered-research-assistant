import streamlit as st
import requests
import os
from streamlit_pdf_viewer import pdf_viewer

BACKEND_URL = "http://127.0.0.1:8000"

st.set_page_config(page_title="AI Research Assistant", layout="wide")

# 🧠 Session state
if "messages" not in st.session_state:
    st.session_state.messages = []

if "uploaded" not in st.session_state:
    st.session_state.uploaded = False

if "file_path" not in st.session_state:
    st.session_state.file_path = None

if "selected_page" not in st.session_state:
    st.session_state.selected_page = 1

UPLOAD_DIR = "uploaded_papers"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 🔥 SIDEBAR
with st.sidebar:
    st.header("📄 Controls")

    uploaded_file = st.file_uploader("Upload PDF", type=["pdf"])

    if uploaded_file and not st.session_state.uploaded:
        file_path = os.path.join(UPLOAD_DIR, uploaded_file.name)

        with open(file_path, "wb") as f:
            f.write(uploaded_file.read())

        st.session_state.file_path = file_path

        st.success("File uploaded!")
        st.info(uploaded_file.name)

        with open(file_path, "rb") as f:
            response = requests.post(f"{BACKEND_URL}/upload", files={"file": f})

        if response.status_code == 200:
            st.success("PDF processed!")
            st.session_state.uploaded = True
        else:
            st.error("Upload failed")

    if st.button("🗑️ Clear Chat"):
        st.session_state.messages = []

# 🎯 MAIN UI
st.title("🧠 AI Research Assistant")

# 📄 PDF Preview
if st.session_state.file_path:
    st.subheader("📄 PDF Preview")
    st.info(f"📍 Page: {st.session_state.selected_page}")

    pdf_viewer(
        st.session_state.file_path,
        key=f"pdf_{st.session_state.selected_page}"
    )

# 💬 Chat
st.subheader("💬 Chat")

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

query = st.chat_input("Ask something about the paper...")

if query:

    # 🚫 STOP if no PDF uploaded
    if not st.session_state.uploaded:
        st.warning("⚠️ Please upload a PDF first")
        st.stop()

    # 👤 Save user message
    st.session_state.messages.append({"role": "user", "content": query})
    # 👤 Save user message
    st.session_state.messages.append({"role": "user", "content": query})

    with st.chat_message("user"):
        st.markdown(query)

    # 🤖 Assistant response
    with st.chat_message("assistant"):
        placeholder = st.empty()
        full_text = ""

        try:
            # 🚀 STREAM ANSWER
            response = requests.post(
                f"{BACKEND_URL}/ask-stream",
                json={
                    "query": query,
                    "history": st.session_state.messages
                },
                stream=True
            )

            for chunk in response.iter_content(chunk_size=20):
                if chunk:
                    text = chunk.decode("utf-8")
                    full_text += text
                    placeholder.markdown(full_text)

            # 📚 FETCH SOURCES
            sources_response = requests.post(
                f"{BACKEND_URL}/ask",
                json={
                    "query": query,
                    "history": st.session_state.messages
                }
            )

            if sources_response.status_code == 200:
                data = sources_response.json()

                with st.expander("📚 Sources"):
                    for i, src in enumerate(data["sources"]):
                        col1, col2 = st.columns([4, 1])

                        with col1:
                            st.markdown(
                                f"""
                                <div style="
                                    padding:10px;
                                    border-radius:8px;
                                    background-color:#1e293b;
                                    color:white;
                                    margin-bottom:10px;
                                ">
                                    {src["text"]}
                                </div>
                                """,
                                unsafe_allow_html=True
                            )

                        with col2:
                            if st.button(
                                f"📍 Page {src['page']}",
                                key=f"btn_{query}_{i}"
                            ):
                                st.session_state.selected_page = src["page"]
                                st.rerun()

            # ✅ Save assistant message OUTSIDE source block
            st.session_state.messages.append({
                "role": "assistant",
                "content": full_text
            })

        except Exception as e:
            st.error(f"Connection error: {e}")