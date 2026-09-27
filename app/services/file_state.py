import json
from pathlib import Path


def get_state_path(repository_id):
    return Path("data/repositories_data") / repository_id / "file_state.json"


def load_file_state(repository_id):
    state_path = get_state_path(repository_id)

    if not state_path.exists():
        return {}

    with state_path.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_file_state(repository_id, state):
    state_path = get_state_path(repository_id)

    state_path.parent.mkdir(parents=True, exist_ok=True)

    with state_path.open("w", encoding="utf-8") as file:
        json.dump(state, file, indent=2)

        