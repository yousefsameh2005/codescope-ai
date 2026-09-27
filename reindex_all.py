import shutil
from pathlib import Path

from app.services.indexer import index_repository


REPOSITORIES_PATH = Path("data/repositories")
VECTOR_STORE_PATH = Path("data/chroma_db")


def clean_old_data():
    if VECTOR_STORE_PATH.exists():
        shutil.rmtree(VECTOR_STORE_PATH)


def main():
    repositories = [
        path
        for path in REPOSITORIES_PATH.iterdir()
        if path.is_dir()
    ]

    print(f"Found {len(repositories)} repositories")
    print()

    clean_old_data()

    for index, repository_path in enumerate(repositories, start=1):
        repository_id = repository_path.name

        print("=" * 70)
        print(f"[{index}/{len(repositories)}] Indexing: {repository_id}")
        print("=" * 70)

        result = index_repository(
            repository_id,
            repository_path,
            force_reindex=True,
        )

        print(result)
        print()

    print("=" * 70)
    print("Clean re-index completed")
    print("=" * 70)


if __name__ == "__main__":
    main()