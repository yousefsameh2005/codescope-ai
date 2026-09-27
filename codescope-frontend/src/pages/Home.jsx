import { useMemo, useState } from "react";
import {
  Code2,
  FolderGit2,
  FileText,
  Settings,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function Home({
  repositories = [],
  loading,
  error,
  onRefresh,
  onOpenRepository,
  onAddRepository,
  onSettings,
  onDocumentation,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredRepositories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return repositories.filter((repository) => {
      const name = repository?.name || "";
      const status = repository?.status || "ready";

      const matchesSearch =
        !query || name.toLowerCase().includes(query);

      const normalizedStatus =
        status.toLowerCase() === "processing"
          ? "processing"
          : status.toLowerCase() === "failed"
            ? "failed"
            : "ready";

      const matchesFilter =
        filter === "all" || normalizedStatus === filter;

      return matchesSearch && matchesFilter;
    });
  }, [repositories, search, filter]);

  return (
    <div className="repositories-page">
      <aside className="repositories-sidebar">
        <div className="repositories-brand">
          <div className="brand-mark">
            <Code2 size={20} />
          </div>

          <span>CodeScope</span>
        </div>

        <nav className="repositories-nav">
          <button
            className="repositories-nav-item active"
            onClick={() => {}}
          >
            <FolderGit2 size={19} />
            <span>Repositories</span>
          </button>

          <button
            className="repositories-nav-item"
            onClick={() => onAddRepository("git")}
          >
            <Plus size={20} />
            <span>New Repository</span>
          </button>

          <button
            className="repositories-nav-item"
            onClick={onDocumentation}
          >
            <FileText size={19} />
            <span>Documentation</span>
          </button>

          <button
            className="repositories-nav-item"
            onClick={onSettings}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="repositories-sidebar-footer">
          <div className="api-status">
            <span />
            API Connected
          </div>

          <div className="version">
            CodeScope v1.0
          </div>
        </div>
      </aside>

      <main className="repositories-content">
        <div className="repositories-header">
          <div className="repositories-heading">
            <div className="eyebrow">
              WORKSPACE
            </div>

            <h1>Your repositories</h1>

            <p>
              Select a repository to start asking questions.
            </p>
          </div>

          <div className="repositories-actions">
            <div className="repository-search">
              <Search size={18} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search repositories..."
              />
            </div>

            <button
              className="repository-action secondary"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw
                size={18}
                className={loading ? "spin" : ""}
              />

              Refresh
            </button>

            <button
              className="repository-action primary"
              onClick={() => onAddRepository("git")}
            >
              <Plus size={19} />
              Add Repository
            </button>
          </div>
        </div>

        <div className="repositories-toolbar">
          <div className="repository-filters">
            {[
              ["all", "All"],
              ["ready", "Ready"],
              ["processing", "Processing"],
              ["failed", "Failed"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`repository-filter ${
                  filter === value ? "active" : ""
                }`}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <button className="repository-sort">
            <SlidersHorizontal size={16} />
            Last updated
            <ChevronDown size={16} />
          </button>
        </div>

        {error && (
          <div className="repositories-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="repositories-loading">
            <div className="repositories-loader" />
          </div>
        ) : filteredRepositories.length ? (
          <div className="repositories-grid">
            {filteredRepositories.map((repository) => {
              const status =
                repository?.status?.toLowerCase() ===
                "processing"
                  ? "processing"
                  : repository?.status?.toLowerCase() ===
                    "failed"
                    ? "failed"
                    : "ready";

              return (
                <button
                  key={
                    repository.id ||
                    repository.name
                  }
                  className="repository-card"
                  onClick={() =>
                    onOpenRepository(repository)
                  }
                >
                  <div className="repository-card-icon">
                    <FolderGit2 size={25} />
                  </div>

                  <div className="repository-card-content">
                    <div className="repository-card-top">
                      <div>
                        <h2>
                          {repository.name}
                        </h2>

                        <div className="repository-meta">
                          <span>
                            {status === "ready"
                              ? "Indexed and ready"
                              : status ===
                                "processing"
                                ? "Processing repository"
                                : "Processing failed"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`repository-status ${status}`}
                      >
                        <span />

                        {status === "ready"
                          ? "Ready"
                          : status ===
                            "processing"
                            ? "Processing"
                            : "Failed"}
                      </span>
                    </div>

                    <div className="repository-card-bottom">
                      <span>
                        {repository.path ||
                          "Repository available in workspace"}
                      </span>

                      <ChevronRight size={20} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="repositories-empty">
            <div className="repositories-empty-icon">
              <FolderGit2 size={28} />
            </div>

            <h2>No repositories found</h2>

            <p>
              {search
                ? "Try a different search."
                : "Add your first repository to get started."}
            </p>

            {!search && (
              <button
                className="repository-action primary"
                onClick={() =>
                  onAddRepository("git")
                }
              >
                <Plus size={18} />
                Add Repository
              </button>
            )}
          </div>
        )}

        <div className="repositories-footer">
          <div className="footer-wave" />

          <span>
            “Understand your codebase in seconds.”
          </span>

          <div className="footer-line" />
        </div>
      </main>
    </div>
  );
}