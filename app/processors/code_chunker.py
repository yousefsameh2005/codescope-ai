from langchain_text_splitters import RecursiveCharacterTextSplitter, Language


EXTENSION_LANGUAGE_MAP = {
    ".py": Language.PYTHON,
    ".js": Language.JS,
    ".jsx": Language.JS,
    ".ts": Language.TS,
    ".tsx": Language.TS,
    ".java": Language.JAVA,
    ".cpp": Language.CPP,
    ".c": Language.C,
    ".cs": Language.CSHARP,
    ".go": Language.GO,
    ".rs": Language.RUST,
    ".php": Language.PHP,
    ".rb": Language.RUBY,
    ".html": Language.HTML,
    ".md": Language.MARKDOWN,
}


def chunk_documents(documents):
    chunks = []

    for document in documents:
        file_type = document.metadata.get("file_type", "").lower()
        language = EXTENSION_LANGUAGE_MAP.get(file_type)

        if language is not None:
            splitter = RecursiveCharacterTextSplitter.from_language(
                language=language,
                chunk_size=1600,
                chunk_overlap=250,
            )
        else:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1600,
                chunk_overlap=250,
            )

        doc_chunks = splitter.split_documents([document])

        file_name = document.metadata.get("file_name", document.metadata.get("file", ""))
        file_path = document.metadata.get("relative_path", document.metadata.get("path", ""))

        total_chunks = len(doc_chunks)

        for index, chunk in enumerate(doc_chunks):
            header = f"File: {file_name}\nPath: {file_path}\nChunk: {index + 1}/{total_chunks}\n---\n"
            chunk.page_content = header + chunk.page_content
            
            chunk.metadata["chunk_index"] = index
            chunk.metadata["total_chunks"] = total_chunks
            
            chunks.append(chunk)

    return chunks