import fitz
import re


def clean_text(text: str) -> str:
    import re

    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text)

    # Remove weird tokens
    text = text.replace("<pad>", "").replace("<EOS>", "")

    # 🔥 REMOVE REFERENCES SECTION
    lower_text = text.lower()
    if "references" in lower_text:
        text = text[:lower_text.index("references")]

    return text.strip()

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    doc = fitz.open(file_path)

    for page in doc:
        text += page.get_text()

    return clean_text(text)