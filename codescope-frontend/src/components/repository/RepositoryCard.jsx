import { ArrowRight, FolderGit2 } from "lucide-react";

export default function RepositoryCard({ repository, onOpen }) {
  return (
    <button className="repository-card" onClick={() => onOpen(repository)}>
      <div className="repository-card-icon"><FolderGit2 size={25} /></div>
      <div className="repository-card-copy">
        <span>Repository</span>
        <strong>{repository.name}</strong>
        <small>Indexed and ready for questions</small>
      </div>
      <ArrowRight size={22} />
    </button>
  );
}