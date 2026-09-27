from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.services.vector_store import get_embeddings
from app.services.reranker import rerank_documents


RETRIEVAL_K = 40
FILE_K = 8
CANDIDATE_CHUNKS_PER_FILE = 4
FINAL_K = 6
RRF_K = 60


def get_vector_store():
    return Chroma(
        persist_directory="data/chroma_db",
        collection_name="code_chunks",
        embedding_function=get_embeddings(),
    )


def file_key(document):
    return (
        document.metadata.get("repository_id"),
        document.metadata.get("relative_path"),
    )


def chunk_key(document):
    return (
        document.metadata.get("repository_id"),
        document.metadata.get("relative_path"),
        document.page_content,
    )


def semantic_search(repository_id, query):
    vector_store = get_vector_store()

    try:
        results = vector_store.similarity_search_with_relevance_scores(
            query,
            k=RETRIEVAL_K,
            filter={
                "repository_id": repository_id,
            },
        )
    except Exception:
        results = []

    documents = []

    for rank, (document, score) in enumerate(results, start=1):
        document.metadata["semantic_score"] = float(score)
        document.metadata["semantic_rank"] = rank
        document.metadata["retrieval_method"] = "semantic"

        documents.append(document)

    return documents


def keyword_search(repository_id, query):
    vector_store = get_vector_store()

    try:
        results = vector_store.get(
            where={
                "repository_id": repository_id,
            },
            include=["documents", "metadatas"],
        )
    except Exception:
        return []

    query_terms = {
        term.lower().strip(".,?!:;()[]{}'\"")
        for term in query.split()
        if len(term.strip(".,?!:;()[]{}'\"")) >= 3
    }

    if not query_terms:
        return []

    documents = []

    for content, metadata in zip(
        results.get("documents", []),
        results.get("metadatas", []),
    ):
        if not content:
            continue

        text = content.lower()

        matched_terms = sum(
            1
            for term in query_terms
            if term in text
        )

        if matched_terms == 0:
            continue

        keyword_score = matched_terms / len(query_terms)

        document = Document(
            page_content=content,
            metadata=dict(metadata or {}),
        )

        document.metadata["keyword_score"] = float(keyword_score)
        document.metadata["retrieval_method"] = "keyword"

        documents.append(document)

    documents.sort(
        key=lambda d: d.metadata["keyword_score"],
        reverse=True,
    )

    documents = documents[:RETRIEVAL_K]

    for rank, document in enumerate(documents, start=1):
        document.metadata["keyword_rank"] = rank

    return documents


def file_level_fusion(semantic_documents, keyword_documents):
    files = {}

    for rank, document in enumerate(semantic_documents, start=1):
        key = file_key(document)

        if key not in files:
            files[key] = {
                "repository_id": key[0],
                "relative_path": key[1],
                "semantic_rank": rank,
                "semantic_score": document.metadata.get("semantic_score"),
                "keyword_rank": None,
                "keyword_score": None,
                "semantic_chunks": [],
                "keyword_chunks": [],
            }

        files[key]["semantic_chunks"].append(document)

        current_rank = files[key]["semantic_rank"]

        if rank < current_rank:
            files[key]["semantic_rank"] = rank
            files[key]["semantic_score"] = document.metadata.get(
                "semantic_score"
            )

    for rank, document in enumerate(keyword_documents, start=1):
        key = file_key(document)

        if key not in files:
            files[key] = {
                "repository_id": key[0],
                "relative_path": key[1],
                "semantic_rank": None,
                "semantic_score": None,
                "keyword_rank": rank,
                "keyword_score": document.metadata.get("keyword_score"),
                "semantic_chunks": [],
                "keyword_chunks": [],
            }

        files[key]["keyword_chunks"].append(document)

        current_rank = files[key]["keyword_rank"]

        if current_rank is None or rank < current_rank:
            files[key]["keyword_rank"] = rank
            files[key]["keyword_score"] = document.metadata.get(
                "keyword_score"
            )

    fused_files = []

    for file_data in files.values():
        semantic_rank = file_data["semantic_rank"]
        keyword_rank = file_data["keyword_rank"]

        semantic_rrf = (
            1.0 / (RRF_K + semantic_rank)
            if semantic_rank is not None
            else 0.0
        )

        keyword_rrf = (
            1.0 / (RRF_K + keyword_rank)
            if keyword_rank is not None
            else 0.0
        )

        fusion_score = semantic_rrf + keyword_rrf

        file_data["fusion_score"] = float(fusion_score)

        fused_files.append(file_data)

    fused_files.sort(
        key=lambda file_data: file_data["fusion_score"],
        reverse=True,
    )

    return fused_files[:FILE_K]


def get_candidate_chunks(top_files):
    candidates = []

    for file_data in top_files:
        chunks = {}

        for document in file_data["semantic_chunks"]:
            chunks[chunk_key(document)] = document

        for document in file_data["keyword_chunks"]:
            key = chunk_key(document)

            if key not in chunks:
                chunks[key] = document
            else:
                existing = chunks[key]

                existing.metadata["keyword_score"] = document.metadata.get(
                    "keyword_score"
                )

                existing.metadata["keyword_rank"] = document.metadata.get(
                    "keyword_rank"
                )

        file_chunks = list(chunks.values())

        file_chunks.sort(
            key=lambda document: (
                document.metadata.get("semantic_rank", 9999),
                document.metadata.get("keyword_rank", 9999),
            )
        )

        selected_chunks = file_chunks[:CANDIDATE_CHUNKS_PER_FILE]

        for document in selected_chunks:
            has_semantic = document.metadata.get("semantic_rank") is not None
            has_keyword = document.metadata.get("keyword_rank") is not None

            if has_semantic and has_keyword:
                document.metadata["retrieval_method"] = "semantic+keyword"
            elif has_semantic:
                document.metadata["retrieval_method"] = "semantic"
            else:
                document.metadata["retrieval_method"] = "keyword"

        candidates.extend(selected_chunks)

    return candidates


def retrieve_documents(repository_id, query):
    semantic_documents = semantic_search(
        repository_id,
        query,
    )

    keyword_documents = keyword_search(
        repository_id,
        query,
    )

    top_files = file_level_fusion(
        semantic_documents,
        keyword_documents,
    )

    candidate_chunks = get_candidate_chunks(
        top_files,
    )

    if not candidate_chunks:
        return []

    reranked_documents = rerank_documents(
        query,
        candidate_chunks,
        top_k=FINAL_K,
    )

    return reranked_documents