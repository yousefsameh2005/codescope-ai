from pathlib import Path
from urllib.parse import urlparse
import subprocess
import shutil


REPOSITORIES_PATH = Path("data/repositories")


def get_repository_name(repository_url):
    parsed_url = urlparse(repository_url)

    if not parsed_url.scheme or not parsed_url.netloc:
        raise ValueError("Invalid repository URL")

    repository_name = Path(parsed_url.path).name

    if repository_name.endswith(".git"):
        repository_name = repository_name[:-4]

    if not repository_name:
        raise ValueError("Could not determine repository name")

    return repository_name


def clone_repository(repository_url):
    repository_name = get_repository_name(repository_url)

    REPOSITORIES_PATH.mkdir(
        parents=True,
        exist_ok=True,
    )

    repository_path = REPOSITORIES_PATH / repository_name

    if repository_path.exists():
        raise FileExistsError(
            f"Repository '{repository_name}' already exists"
        )

    try:
        subprocess.run(
            [
                "git",
                "clone",
                repository_url,
                str(repository_path),
            ],
            check=True,
        )

    except subprocess.CalledProcessError as error:
        raise RuntimeError(
            "Failed to clone repository"
        ) from error

    return {
        "repository_id": repository_name,
        "repository_path": str(repository_path),
    }


def upload_repository(file_path):
    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    if not file_path.is_file():
        raise ValueError(
            "The provided path is not a file"
        )

    suffix = file_path.suffix.lower()
    full_name_lower = file_path.name.lower()

    is_tar_gz = full_name_lower.endswith(".tar.gz")
    is_tgz = full_name_lower.endswith(".tgz")

    supported_suffixes = (
        ".zip",
        ".rar",
        ".tar",
        ".gz",
        ".tgz",
    )

    if (
        suffix not in supported_suffixes
        and not is_tar_gz
        and not is_tgz
    ):
        raise ValueError(
            "Only .zip, .rar, .tar, .tar.gz, and .gz files are supported"
        )

    if is_tar_gz:
        repository_name = file_path.name[:-7]
    elif is_tgz:
        repository_name = file_path.name[:-4]
    else:
        repository_name = file_path.stem

        if suffix == ".gz":
            repository_name = Path(
                repository_name
            ).stem

    if not repository_name:
        raise ValueError(
            "Could not determine repository name"
        )

    REPOSITORIES_PATH.mkdir(
        parents=True,
        exist_ok=True,
    )

    repository_path = (
        REPOSITORIES_PATH / repository_name
    )

    if repository_path.exists():
        raise FileExistsError(
            f"Repository '{repository_name}' already exists"
        )

    repository_path.mkdir(
        parents=True,
        exist_ok=False,
    )

    try:
        shutil.unpack_archive(
            str(file_path),
            str(repository_path),
        )

    except Exception as error:
        if repository_path.exists():
             shutil.rmtree(repository_path)

        print(f"ARCHIVE EXTRACTION ERROR: {repr(error)}")

        raise RuntimeError(
            f"Failed to extract repository: {error}"
    ) from error

    return {
        "repository_id": repository_name,
        "repository_path": str(repository_path),
    }