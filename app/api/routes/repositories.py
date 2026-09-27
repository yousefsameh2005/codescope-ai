from pathlib import Path
import shutil
import threading

from fastapi import (
    APIRouter,
    HTTPException,
    UploadFile,
    File,
)
from pydantic import BaseModel

from app.services.repository_manager import (
    clone_repository,
    upload_repository,
)
from app.services.indexer import (
    index_repository,
    get_repository_status,
)


router = APIRouter(
    prefix="/repositories",
    tags=["Repositories"],
)


class CloneRepositoryRequest(BaseModel):
    repository_url: str


def index_uploaded_or_cloned_repository(
    repository_id: str,
):
    repository_path = (
        Path("data/repositories")
        / repository_id
    )

    if not repository_path.exists():
        raise FileNotFoundError(
            f"Repository '{repository_id}' not found"
        )

    return index_repository(
        repository_id,
        repository_path,
    )


def start_indexing(repository_id: str):
    thread = threading.Thread(
        target=index_uploaded_or_cloned_repository,
        args=(repository_id,),
        daemon=True,
    )
    thread.start()


@router.get("")
def list_repositories():
    repositories_path = Path("data/repositories")

    if not repositories_path.exists():
        return {
            "repositories": []
        }

    repositories = [
        folder.name
        for folder in repositories_path.iterdir()
        if folder.is_dir()
    ]

    return {
        "repositories": repositories
    }


@router.post("/clone")
def clone_repository_endpoint(
    request: CloneRepositoryRequest,
):
    try:
        result = clone_repository(
            request.repository_url
        )

        repository_id = result["repository_id"]

        start_indexing(repository_id)

        return {
            **result,
            "status": "processing",
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except FileExistsError as error:
        raise HTTPException(
            status_code=409,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@router.post("/upload")
def upload_repository_endpoint(
    file: UploadFile = File(...),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file uploaded",
        )

    filename_lower = file.filename.lower()
    is_tar_gz = filename_lower.endswith((".tar.gz", ".tgz"))
    supported_extensions = (".zip", ".rar", ".tar", ".gz", ".tgz")

    if not filename_lower.endswith(supported_extensions) and not is_tar_gz:
        raise HTTPException(
            status_code=400,
            detail="Only .zip, .rar, .tar, .tar.gz, and .gz files are supported",
        )

    uploads_path = Path("data/uploads")
    uploads_path.mkdir(
        parents=True,
        exist_ok=True,
    )

    temporary_file_path = (
        uploads_path / file.filename
    )

    try:
        with temporary_file_path.open(
            "wb"
        ) as buffer:
            shutil.copyfileobj(
                file.file,
                buffer,
            )

        result = upload_repository(
            temporary_file_path
        )

        repository_id = result["repository_id"]

        start_indexing(repository_id)

        return {
            **result,
            "status": "processing",
        }

    except FileExistsError as error:
        raise HTTPException(
            status_code=409,
            detail=str(error),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

    finally:
        if temporary_file_path.exists():
            temporary_file_path.unlink()


@router.post("/documents")
def upload_document_endpoint(
    file: UploadFile = File(...),
):
    """Upload an independent architectural PDF document, create a repository for it, and index it automatically."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only .pdf files are supported",
        )

    repository_id = Path(file.filename).stem.lower().replace(" ", "_")
    repository_path = Path("data/repositories") / repository_id
    repository_path.mkdir(parents=True, exist_ok=True)

    file_path = repository_path / file.filename

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        start_indexing(repository_id)

        return {
            "message": f"Document '{file.filename}' uploaded successfully.",
            "repository_id": repository_id,
            "file_name": file.filename,
            "status": "processing",
        }

    except Exception as error:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@router.get("/{repository_id}/status")
def repository_status_endpoint(repository_id: str):
    return get_repository_status(repository_id)


@router.post("/{repository_id}/index")
def index_repository_endpoint(
    repository_id: str,
):
    repository_path = (
        Path("data/repositories")
        / repository_id
    )

    if not repository_path.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                f"Repository "
                f"'{repository_id}' not found"
            ),
        )

    if not repository_path.is_dir():
        raise HTTPException(
            status_code=400,
            detail=(
                "Repository path "
                "is not a directory"
            ),
        )

    try:
        result = index_repository(
            repository_id,
            repository_path,
        )

        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

