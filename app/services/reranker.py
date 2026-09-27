from sentence_transformers import CrossEncoder

MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"

_reranker = None


def get_reranker():
    global _reranker

    if _reranker is None:
        print("Loading reranker model...")
        _reranker = CrossEncoder(MODEL_NAME)

    return _reranker


def rerank_documents(query, documents, top_k=5):
    if not documents:
        return []

    reranker = get_reranker()

    pairs = []
    for document in documents:
        file_path = document.metadata.get("relative_path", "Unknown")
        enriched_content = f"Path: {file_path}\n---\n{document.page_content}"
        pairs.append((query, enriched_content))

    scores = reranker.predict(pairs)

    ranked_documents = []

    for document, score in zip(documents, scores):
        document.metadata["reranker_score"] = float(score)
        document.metadata["retrieval_method"] = (
            document.metadata.get("retrieval_method", "retrieval")
            + "+reranker"
        )
        ranked_documents.append(document)

    ranked_documents.sort(
        key=lambda document: document.metadata["reranker_score"],
        reverse=True,
    )

    for rank, document in enumerate(ranked_documents, start=1):
        document.metadata["reranker_rank"] = rank

    return ranked_documents[:top_k]