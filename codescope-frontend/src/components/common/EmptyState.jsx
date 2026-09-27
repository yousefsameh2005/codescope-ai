import { FolderOpen } from "lucide-react";

export default function EmptyState({ title = "No repositories yet", description = "Add a repository to get started." }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><FolderOpen size={24} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}