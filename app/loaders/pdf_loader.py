import hashlib
from pathlib import Path

from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader


def get_file_hash(content):
    return hashlib.sha256(
        content.encode("utf-8")
    ).hexdigest()


def load_pdf_files(repository_path):
    repository_path = Path(repository_path)
    documents = []

    for file_path in repository_path.rglob("*.pdf"):
        if not file_path.is_file():
            continue

        try:
            loader = PyPDFLoader(str(file_path))
            pages = loader.load()
        except Exception:
            continue

        for page in pages:
            content = page.page_content.strip()
            if not content:
                continue

            relative_path = file_path.relative_to(repository_path)

            document = Document(
                page_content=content,
                metadata={
                    "repository_id": str(repository_path.name),
                    "source": str(file_path),
                    "relative_path": str(relative_path),
                    "file_name": file_path.name,
                    "file_type": ".pdf",
                    "file_hash": get_file_hash(content),
                    "source_type": "document",
                },
            )
            documents.append(document)

    return documents