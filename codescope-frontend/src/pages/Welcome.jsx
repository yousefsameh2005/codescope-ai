import {
  FileText,
  FolderOpen,
  Github,
  Upload,
} from "lucide-react";

export default function Welcome({ onAddRepository, onOpenRepository }) {
  return (
    <div className="welcome-page">
      <div className="welcome-topbar">
        <div className="brand">
          <div className="brand-mark">
            <span>&lt;/&gt;</span>
          </div>

          <span>CodeScope</span>
        </div>
      </div>

      <main className="welcome-content">
        <div className="eyebrow">
          AI POWERED REPOSITORY INTELLIGENCE
        </div>

        <h1>
          Understand your codebase <span>in seconds.</span>
        </h1>

        <p>
          Ask questions about your repository, explore architecture,
          <br />
          understand code, and discover how everything works.
        </p>

        <div className="welcome-actions">
          <button
            type="button"
            onClick={onOpenRepository}
          >
            <div className="welcome-icon">
              <FolderOpen size={27} />
            </div>

            <strong>
              Open an existing
              <br />
              repository
            </strong>

            <small>
              Choose from your
              <br />
              indexed projects
            </small>
          </button>

          <button
            type="button"
            onClick={() => onAddRepository("git")}
          >
            <div className="welcome-icon">
              <Github size={27} />
            </div>

            <strong>
              Clone from GitHub
            </strong>

            <small>
              Connect a repository
              <br />
              using a Git URL
            </small>
          </button>

          <button
            type="button"
            onClick={() => onAddRepository("archive")}
          >
            <div className="welcome-icon">
              <Upload size={27} />
            </div>

            <strong>
              Upload project
            </strong>

            <small>
              Upload a project
              <br />
              archive
            </small>
          </button>

          <button
            type="button"
            onClick={() => onAddRepository("documentation")}
          >
            <div className="welcome-icon">
              <FileText size={27} />
            </div>

            <strong>
              Upload documentation
            </strong>

            <small>
              Upload a PDF
              <br />
              for repository context
            </small>
          </button>
        </div>
      </main>
    </div>
  );
}