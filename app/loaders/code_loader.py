import hashlib
from pathlib import Path

from langchain_core.documents import Document


ALLOWED_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".java",
    ".cpp",
    ".c",
    ".cs",
    ".go",
    ".rs",
    ".php",
    ".rb",
    ".md",
    ".txt",
    ".json",
    ".html",
    ".css",
}

IGNORED_DIRECTORIES = {
    ".git",
    ".venv",
    "venv",
    "node_modules",
    "__pycache__",
    "dist",
    "build",
    "image",
    "images",
    "assets",
    "static",
    ".vscode",
    ".idea",
    ".next",
    "coverage",
    ".pytest_cache",
}

IGNORED_FILES = {
    ".env",
    ".env.local",
    ".env.production",
    "secret.key",
    # Lock files & noise files that bloat embeddings
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "composer.lock",
    "Cargo.lock",
    "poetry.lock",
    "Pipfile.lock",
}


def is_allowed_file(file_path: Path) -> bool:
    if file_path.name in IGNORED_FILES:
        return False

    if any(parent.name in IGNORED_DIRECTORIES for parent in file_path.parents):
        return False

    return file_path.suffix.lower() in ALLOWED_EXTENSIONS


def get_file_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def load_code_files(repository_path):
    repository_path = Path(repository_path)
    files = []

    for file_path in repository_path.rglob("*"):
        if not file_path.is_file():
            continue

        if not is_allowed_file(file_path):
            continue

        try:
            content = file_path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            try:
                content = file_path.read_text(encoding="utf-8-sig")
            except Exception:
                continue

        if "\x00" in content:
            continue

        if not content.strip():
            continue

        relative_path = file_path.relative_to(repository_path)

        files.append({
            "path": str(file_path),
            "relative_path": str(relative_path),
            "content": content,
            "hash": get_file_hash(content),
        })

    return files


def create_documents(files, repository_id):
    documents = []

    for file in files:
        file_path = Path(file["path"])

        document = Document(
            page_content=file["content"],
            metadata={
                "repository_id": repository_id,
                "source": str(file_path),
                "relative_path": file["relative_path"],
                "file_name": file_path.name,
                "file_type": file_path.suffix,
                "file_hash": file["hash"],
            },
        )

        documents.append(document)

    return documents