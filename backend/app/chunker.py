def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100):
    """
    Splits text into overlapping chunks.
    
    Args:
        text (str): Full extracted text
        chunk_size (int): Number of words per chunk
        overlap (int): Overlapping words between chunks

    Returns:
        List[str]: List of text chunks
    """

    words = text.split()
    chunks = []

    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)

        start += chunk_size - overlap

    return chunks
