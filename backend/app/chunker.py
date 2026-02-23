"""
    Splits text into overlapping chunks.
    
    Args:
        text (str): Full extracted text
        chunk_size (int): Number of words per chunk
        overlap (int): Overlapping words between chunks

    Returns:
        List[str]: List of text chunks
    """
def chunk_text(text: str, chunk_size=500, overlap=100):
    words = text.split()
    chunks = []

    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])

        # 🔥 FILTER BAD CHUNKS
        if len(chunk) > 100:
            if "et al" not in chunk.lower():
                if "arxiv" not in chunk.lower():
                    chunks.append(chunk)

        start += chunk_size - overlap

    return chunks