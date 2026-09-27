import { Code2, Plus, RefreshCw } from "lucide-react";

export default function Header({ onRefresh, onAddRepository }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark"><Code2 size={20} /></div>
        <span>CodeScope</span>
      </div>
      <div className="topbar-actions">
        <button className="header-button secondary" onClick={onRefresh}>
          <RefreshCw size={18} />
          Refresh
        </button>
        <button className="header-button primary" onClick={onAddRepository}>
          <Plus size={19} />
          Add Repository
        </button>
      </div>
    </header>
  );
}