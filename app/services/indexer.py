from app.loaders.code_loader import load_code_files, create_documents as create_code_documents
from app.loaders.pdf_loader import load_pdf_files
from app.processors.code_chunker import chunk_documents
from app.services.file_state import load_file_state, save_file_state
from app.services.vector_store import (
    add_documents,
    delete_file_documents,
)


_repository_status = {}


def get_repository_status(repository_id):
    return _repository_status.get(
        repository_id,
        {
            "status": "unknown",
            "progress": 0,
        },
    )


def set_repository_status(repository_id, status, progress=0):
    _repository_status[repository_id] = {
        "status": status,
        "progress": progress,
    }


def index_repository(repository_id, repository_path, force_reindex=False):
    set_repository_status(repository_id, "reading_files", 10)

    old_state = load_file_state(repository_id)

    raw_files = load_code_files(repository_path)
    files = [
        f for f in raw_files
        if not f["relative_path"].endswith("-backup.js")
        and "-backup" not in f["relative_path"]
    ]

    new_state = {
        file["relative_path"]: file["hash"]
        for file in files
    }

    old_files = set(old_state.keys())
    new_files = set(new_state.keys())

    deleted_files = old_files - new_files

    if force_reindex:
        new_or_changed_files = files
    else:
        new_or_changed_files = [
            file
            for file in files
            if (
                file["relative_path"] not in old_state
                or old_state[file["relative_path"]] != file["hash"]
            )
        ]

    for relative_path in deleted_files:
        delete_file_documents(
            repository_id,
            relative_path
        )

    if force_reindex:
        for file in files:
            delete_file_documents(
                repository_id,
                file["relative_path"]
            )
    else:
        for file in new_or_changed_files:
            delete_file_documents(
                repository_id,
                file["relative_path"]
            )

    set_repository_status(repository_id, "creating_documents", 25)

    code_documents = create_code_documents(
        new_or_changed_files,
        repository_id,
    )

    pdf_documents = load_pdf_files(repository_path)

    documents = code_documents + pdf_documents

    set_repository_status(repository_id, "chunking", 40)

    chunks = chunk_documents(documents)

    if chunks:
        set_repository_status(repository_id, "indexing", 60)
        add_documents(repository_id, chunks)

    set_repository_status(repository_id, "finalizing", 90)

    save_file_state(repository_id, new_state)

    result = {
        "total_files": len(files),
        "new_or_changed_files": len(new_or_changed_files),
        "deleted_files": len(deleted_files),
        "chunks_added": len(chunks),
    }

    set_repository_status(repository_id, "ready", 100)

    return result