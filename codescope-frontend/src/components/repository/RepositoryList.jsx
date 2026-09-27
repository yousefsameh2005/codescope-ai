import RepositoryCard from "./RepositoryCard";
import EmptyState from "../common/EmptyState";

export default function RepositoryList({ repositories = [], onOpen }) {
  if (!repositories.length) {
    return <EmptyState />;
  }

  return (
    <div className="repository-grid">
      {repositories.map((repository) => (
        <RepositoryCard
          key={repository.id || repository.name}
          repository={repository}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}