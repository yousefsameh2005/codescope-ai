import {
  ArrowLeft,
  BookOpen,
  FileText,
  FolderGit2,
  Github,
  Upload,
} from "lucide-react";

export default function Documentation({
  onBack,
  onAddRepository,
  onOpenSettings,
}) {
  return (
    <div className="repositories-page">
      <aside className="repositories-sidebar">
        <div className="repositories-brand">
          <div className="brand-mark">
            <span>&lt;/&gt;</span>
          </div>

          <span>CodeScope</span>
        </div>

        <nav className="repositories-nav">
          <button
            type="button"
            className="repositories-nav-item"
            onClick={onBack}
          >
            <FolderGit2 size={19} />
            <span>Repositories</span>
          </button>

          <button
            type="button"
            className="repositories-nav-item"
            onClick={() => onAddRepository("git")}
          >
            <Github size={19} />
            <span>New Repository</span>
          </button>

          <button
            type="button"
            className="repositories-nav-item active"
          >
            <FileText size={19} />
            <span>Documentation</span>
          </button>

          <button
            type="button"
            className="repositories-nav-item"
            onClick={onOpenSettings}
          >
            <BookOpen size={19} />
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
        <button
          type="button"
          className="documentation-back"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back to repositories
        </button>

        <div className="documentation-page-header">
          <div className="eyebrow">
            DOCUMENTATION
          </div>

          <h1>CodeScope Documentation</h1>

          <p>
            Learn how to use CodeScope to understand,
            analyze, and explore your repositories.
          </p>
        </div>

        <div className="documentation-grid">
          <div className="documentation-card">
            <div className="documentation-card-icon">
              <Github size={23} />
            </div>

            <h2>Clone from GitHub</h2>

            <p>
              Connect a public GitHub repository using
              its Git URL and let CodeScope analyze it.
            </p>

            <button
              type="button"
              onClick={() => onAddRepository("git")}
            >
              Add Git Repository
            </button>
          </div>

          <div className="documentation-card">
            <div className="documentation-card-icon">
              <Upload size={23} />
            </div>

            <h2>Upload a project</h2>

            <p>
              Upload your project archive and use it as
              a repository source for analysis.
            </p>

            <button
              type="button"
              onClick={() => onAddRepository("archive")}
            >
              Upload Project
            </button>
          </div>

          <div className="documentation-card">
            <div className="documentation-card-icon">
              <FileText size={23} />
            </div>

            <h2>Upload documentation</h2>

            <p>
              Add PDF documentation to provide additional
              context for your repository.
            </p>

            <button
              type="button"
              onClick={() => onAddRepository("documentation")}
            >
              Upload Documentation
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}