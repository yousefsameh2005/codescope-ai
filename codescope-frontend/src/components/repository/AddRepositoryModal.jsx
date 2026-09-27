import { useRef, useState } from "react";
import {
  ArrowLeft,
  FileArchive,
  FileText,
  FolderGit2,
  Github,
  X,
} from "lucide-react";
import Button from "../common/Button";
import {
  formatFileSize,
  isDocumentation,
  isZip,
} from "../../utils/fileUtils";

const options = [
  {
    id: "git",
    label: "Git Repository",
    icon: Github,
  },
  {
    id: "archive",
    label: "ZIP / Archive",
    icon: FileArchive,
  },
  {
    id: "existing",
    label: "Existing Repository",
    icon: FolderGit2,
  },
  {
    id: "documentation",
    label: "Upload Documentation",
    icon: FileText,
  },
];

export default function AddRepositoryModal({
  onClose,
  onSubmit,
  initialType = "git",
}) {
  const [active, setActive] = useState(initialType);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef(null);

  const selectFile = () => {
    if (submitting) {
      return;
    }

    inputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
  if (active === "git") {
    if (!url.trim()) {
      return;
    }

    onSubmit({
      type: "git",
      url: url.trim(),
    });

    return;
  }

  if (active === "archive") {
    if (!file || !isZip(file)) {
      return;
    }

    onSubmit({
      type: "archive",
      file,
    });

    return;
  }

  if (active === "documentation") {
    if (!file || !isDocumentation(file)) {
      return;
    }

    await onSubmit({
      type: "documentation",
      file,
    });

    return;
  }

  if (active === "existing") {
    onClose();
  }
};

  const title =
    active === "documentation"
      ? "Upload Documentation"
      : active === "existing"
        ? "Existing Repository"
        : "Add Repository";

  const action =
    active === "git"
      ? "Clone and Analyze"
      : active === "documentation"
        ? "Upload and Analyze"
        : active === "archive"
          ? "Upload and Analyze"
          : "Continue";

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <button
            className="modal-back"
            onClick={onClose}
            aria-label="Back"
            disabled={submitting}
          >
            <ArrowLeft size={18} />
          </button>

          <h2>{title}</h2>

          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-tabs">
          {options.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={active === id ? "active" : ""}
              onClick={() => {
                if (submitting) {
                  return;
                }

                setActive(id);
                setFile(null);
              }}
              disabled={submitting}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {active === "git" && (
          <div className="modal-body">
            <label className="field">
              <span className="field-label">
                Repository URL
              </span>

              <input
                value={url}
                onChange={(event) =>
                  setUrl(event.target.value)
                }
                placeholder="https://github.com/username/repository.git"
                disabled={submitting}
              />

              <span className="field-hint">
                We support public GitHub repositories.
              </span>
            </label>
          </div>
        )}

        {active === "existing" && (
          <div className="modal-body">
            <div className="existing-box">
              <FolderGit2 size={24} />

              <div>
                <strong>
                  Use an existing repository
                </strong>

                <p>
                  Choose one of the repositories already
                  available in your workspace.
                </p>
              </div>
            </div>
          </div>
        )}

        {active === "archive" && (
          <div className="modal-body">
            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".zip,.rar,.tar,.gz,.tgz"
              onChange={handleFileChange}
              disabled={submitting}
            />

            <button
              className="upload-dropzone"
              onClick={selectFile}
              type="button"
              disabled={submitting}
            >
              <FileArchive size={30} />

              <strong>
                {file
                  ? file.name
                  : "Choose a ZIP / Archive file"}
              </strong>

              <span>
                {file
                  ? formatFileSize(file.size)
                  : "ZIP, RAR, TAR, GZ, and TGZ files"}
              </span>
            </button>
          </div>
        )}

        {active === "documentation" && (
          <div className="modal-body">
            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={submitting}
            />

            <button
              className="upload-dropzone"
              onClick={selectFile}
              type="button"
              disabled={submitting}
            >
              <FileText size={30} />

              <strong>
                {file
                  ? file.name
                  : "Choose a PDF documentation file"}
              </strong>

              <span>
                {file
                  ? formatFileSize(file.size)
                  : "PDF files only"}
              </span>
            </button>
          </div>
        )}

        <div className="modal-actions">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Processing..." : action}
          </Button>
        </div>
      </div>
    </div>
  );
}