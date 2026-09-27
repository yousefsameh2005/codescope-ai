from pathlib import Path
from functools import lru_cache
from typing import List

from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


BATCH_SIZE = 50

CHROMA_DIRECTORY = Path("data/chroma_db")

COLLECTION_NAME = "code_chunks"


class E5Embeddings(HuggingFaceEmbeddings):
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return super().embed_documents(
            [f"passage: {text}" for text in texts]
        )

    def embed_query(self, text: str) -> List[float]:
        return super().embed_query(
            f"query: {text}"
        )


@lru_cache(maxsize=1)
def get_embeddings():
    print("Loading embedding model...")

    return E5Embeddings(
        model_name="intfloat/multilingual-e5-small",
        encode_kwargs={
            "normalize_embeddings": True
        }
    )


def get_vector_store():
    CHROMA_DIRECTORY.mkdir(
        parents=True,
        exist_ok=True
    )

    return Chroma(
        persist_directory=str(CHROMA_DIRECTORY),
        collection_name=COLLECTION_NAME,
        embedding_function=get_embeddings(),
    )


def add_documents(repository_id, documents):
    vector_store = get_vector_store()

    for document in documents:
        document.metadata["repository_id"] = repository_id

    total = len(documents)

    for start in range(0, total, BATCH_SIZE):
        batch = documents[start:start + BATCH_SIZE]

        vector_store.add_documents(batch)

        current = min(start + BATCH_SIZE, total)

        print(
            f"Indexed {current}/{total} chunks"
        )


def delete_file_documents(repository_id, relative_path):
    vector_store = get_vector_store()

    results = vector_store.get(
        where={
            "$and": [
                {
                    "repository_id": repository_id
                },
                {
                    "relative_path": relative_path
                }
            ]
        }
    )

    if results["ids"]:
        vector_store.delete(
            ids=results["ids"]
        )