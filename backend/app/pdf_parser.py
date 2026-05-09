
import fitz
import re
import gc

# =============================
# SETTINGS
# =============================
MAX_PAGES = 80


# =============================
# CLEAN TEXT
# =============================
def clean_text(text: str) -> str:

    # Remove extra spaces/newlines
    text = re.sub(r"\s+", " ", text)

    # Remove weird tokens
    text = text.replace("<pad>", "").replace("<EOS>", "")

    # Remove references section
    lower_text = text.lower()

    if "references" in lower_text:
        text = text[:lower_text.index("references")]

    return text.strip()


# =============================
# EXTRACT FULL TEXT
# =============================
def extract_text_from_pdf(file_path: str) -> str:

    text = ""

    doc = fitz.open(file_path)

    try:
        for page_num, page in enumerate(doc):

            # 🔥 PAGE LIMIT
            if page_num >= MAX_PAGES:
                print(f"PDF truncated to {MAX_PAGES} pages")
                break

            page_text = page.get_text()

            if not page_text.strip():
                continue

            text += page_text + "\n"

        cleaned = clean_text(text)

        gc.collect()

        return cleaned

    finally:
        doc.close()


# =============================
# EXTRACT TEXT WITH PAGES
# =============================
def extract_text_with_pages(pdf_path):

    doc = fitz.open(pdf_path)

    pages = []

    try:
        for i, page in enumerate(doc):

            # 🔥 PAGE LIMIT
            if i >= MAX_PAGES:
                print(f"Stopped processing after {MAX_PAGES} pages")
                break

            text = page.get_text()

            # Skip empty pages
            if not text.strip():
                continue

            cleaned = clean_text(text)

            pages.append({
                "page": i + 1,
                "text": cleaned
            })

        gc.collect()

        return pages

    finally:
        doc.close()

