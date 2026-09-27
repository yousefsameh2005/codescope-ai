import { Plus } from "lucide-react";
import { repositoryStatus } from "../../utils/repositoryUtils";

export default function Sidebar({
  repositories = [],
  selectedRepository,
  onSelectRepository,
  onAddRepository,
}) {
  const orderedRepositories = selectedRepository
    ? [
        selectedRepository,
        ...repositories.filter(
          (repository) =>
            repository.id !== selectedRepository.id
        ),
      ]
    : repositories;

  return (
    <aside className="sidebar">
      <div className="sidebar-title-row">
        <span>REPOSITORIES</span>

        <button
          className="icon-button"
          onClick={onAddRepository}
          aria-label="Add repository"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="repo-list">
        {orderedRepositories.map((repository) => (
          <button
            key={repository.id || repository.name}
            className={`sidebar-repository ${
              selectedRepository?.id === repository.id
                ? "selected"
                : ""
            }`}
            onClick={() => onSelectRepository(repository)}
          >
            <span
              className={`repo-dot ${
                repositoryStatus(repository) === "ready"
                  ? "ready"
                  : ""
              }`}
            />

            <span className="sidebar-repo-copy">
              <strong>{repository.name}</strong>

              <small>
                {repositoryStatus(repository) === "ready"
                  ? "Just now"
                  : repositoryStatus(repository)}
              </small>
            </span>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="api-status">
          <span />
          API Connected
        </div>

        <div className="version">
          CodeScope v1.0
        </div>
      </div>
    </aside>
  );
}