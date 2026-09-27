import os
from pathlib import Path

# لازم يكونوا قبل تحميل أي مكتبات تستخدم NumPy / OpenBLAS
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

from app.services.indexer import index_repository
from app.services.rag_chain import ask_repository
from app.services.repository_manager import (
    clone_repository,
    upload_repository,
)


REPOSITORIES_PATH = Path("data/repositories")


def get_repositories():
    if not REPOSITORIES_PATH.exists():
        return []

    return [
        repository
        for repository in REPOSITORIES_PATH.iterdir()
        if repository.is_dir()
    ]


def select_existing_repository():
    repositories = get_repositories()

    if not repositories:
        print("No repositories found.")
        return None

    print("\nAvailable repositories:")

    for index, repository in enumerate(repositories, start=1):
        print(f"{index}. {repository.name}")

    while True:
        choice = input("\nSelect a repository: ").strip()

        if not choice.isdigit():
            print("Please enter a valid number.")
            continue

        choice = int(choice)

        if 1 <= choice <= len(repositories):
            return repositories[choice - 1]

        print("Please select a valid repository.")


def choose_repository():
    print("1. Use existing repository")
    print("2. Clone repository from Git URL")
    print("3. Upload repository from ZIP")

    while True:
        choice = input("\nSelect an option: ").strip()

        # Option 1: Use existing repository
        if choice == "1":
            return select_existing_repository()

        # Option 2: Clone repository from Git URL
        if choice == "2":
            repository_url = input(
                "\nRepository URL: "
            ).strip()

            if not repository_url:
                print("Repository URL cannot be empty.")
                continue

            try:
                result = clone_repository(repository_url)

                print("\nRepository cloned successfully!")

                return Path(result["repository_path"])

            except (
                ValueError,
                FileExistsError,
                RuntimeError,
            ) as error:
                print(f"\nError: {error}")
                return None

        # Option 3: Upload repository from ZIP
        if choice == "3":
            zip_path = input(
                "\nEnter the path to the ZIP file: "
            ).strip()

            if not zip_path:
                print("ZIP file path cannot be empty.")
                continue

            try:
                result = upload_repository(zip_path)

                print("\nRepository uploaded successfully!")

                return Path(result["repository_path"])

            except (
                FileNotFoundError,
                ValueError,
                FileExistsError,
                RuntimeError,
            ) as error:
                print(f"\nError: {error}")
                return None

        print("Please select a valid option.")


def main():
    print("-- CodeScope --\n")

    repository_path = choose_repository()

    if repository_path is None:
        return

    repository_id = repository_path.name

    print(f"\nSelected repository: {repository_id}")
    print("\nIndexing repository...\n")

    result = index_repository(
        repository_id=repository_id,
        repository_path=str(repository_path),
    )

    print("Indexing complete:")
    print(f"Total files: {result['total_files']}")
    print(f"New or changed files: {result['new_or_changed_files']}")
    print(f"Deleted files: {result['deleted_files']}")
    print(f"Chunks added: {result['chunks_added']}")

    print("\nRepository is ready!")
    print("Ask questions about the repository.")
    print("Type 'exit' to quit.\n")

    # Conversation history for the current repository session
    chat_history = []

    while True:
        question = input("You: ").strip()

        if question.lower() in {"exit", "quit"}:
            print("\nGoodbye!")
            break

        if not question:
            continue

        result = ask_repository(
            repository_id,
            question,
            chat_history,
        )

        print("\nCodeScope:")
        print(result["answer"])

        print("\nSources:")
        for source in result["sources"]:
            print(f"- {source}")

        # Save the conversation after receiving the answer
        chat_history.append({
            "question": question,
            "answer": result["answer"],
        })

        print("\n" + "_" * 50 + "\n")


if __name__ == "__main__":
    main()