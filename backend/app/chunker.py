"""
    Splits text into overlapping chunks.
    
    Args:
        text (str): Full extracted text
        chunk_size (int): Number of words per chunk
        overlap (int): Overlapping words between chunks

    Returns:
        List[str]: List of text chunks
    """
def chunk_text(pages, chunk_size=500, overlap=100):
    chunks = []

    for page_data in pages:
        page_num = page_data["page"]
        words = page_data["text"].split()

        start = 0
        while start < len(words):
            chunk = " ".join(words[start:start+chunk_size])

            chunks.append({
                "text": chunk,
                "page": page_num   # 🔥 STORE PAGE
            })

            start += chunk_size - overlap

    return chunks