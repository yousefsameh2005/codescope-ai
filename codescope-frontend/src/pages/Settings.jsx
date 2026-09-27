import { useState } from "react";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Github,
  FileText,
  FolderGit2,
  X,
  Save,
  Check,
} from "lucide-react";

export default function Settings({
  onBack,
  onDocumentation,
  onRepositoryIntegration,
}) {
  const [activeSection, setActiveSection] = useState(null);

  const [workspaceSettings, setWorkspaceSettings] = useState({
    autoRefresh: true,
    autoIndex: true,
  });

  const [integrationSettings, setIntegrationSettings] =
    useState({
      githubEnabled: true,
      autoAnalyze: true,
    });

  const sections = [
    {
      id: "workspace",
      title: "Workspace",
      description:
        "Configure your CodeScope workspace and repository analysis preferences.",
      icon: SettingsIcon,
    },
    {
      id: "integration",
      title: "Repository Integration",
      description:
        "Manage how repositories are connected and analyzed by CodeScope.",
      icon: Github,
    },
    {
      id: "documentation",
      title: "Documentation",
      description:
        "Manage additional documentation used as repository context.",
      icon: FileText,
    },
  ];

  const openSection = (id) => {
    setActiveSection(id);

    if (id === "integration") {
      onRepositoryIntegration?.();
    }
  };

  const closeSection = () => {
    setActiveSection(null);
  };

  const toggleWorkspaceSetting = (key) => {
    setWorkspaceSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const toggleIntegrationSetting = (key) => {
    setIntegrationSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div className="settings-page">
      <aside className="settings-sidebar">
        <div className="settings-brand">
          <div className="brand-mark">
            <span>&lt;/&gt;</span>
          </div>

          <span>CodeScope</span>
        </div>

        <nav className="settings-nav">
          <button
            className="settings-nav-item"
            onClick={onBack}
          >
            <FolderGit2 size={19} />
            <span>Repositories</span>
          </button>

          <button
            className="settings-nav-item"
            onClick={() =>
              onRepositoryIntegration?.()
            }
          >
            <Github size={19} />
            <span>New Repository</span>
          </button>

          <button
            className="settings-nav-item"
            onClick={onDocumentation}
          >
            <FileText size={19} />
            <span>Documentation</span>
          </button>

          <button
            className="settings-nav-item active"
            onClick={() => {}}
          >
            <SettingsIcon size={19} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="settings-sidebar-footer">
          <div className="api-status">
            <span />
            API Connected
          </div>

          <div className="version">
            CodeScope v1.0
          </div>
        </div>
      </aside>

      <main className="settings-content">
        <button
          className="settings-back"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          <span>Back to repositories</span>
        </button>

        <div className="settings-heading">
          <div className="eyebrow">
            SETTINGS
          </div>

          <h1>Settings</h1>

          <p>
            Manage your CodeScope workspace configuration.
          </p>
        </div>

        <div className="settings-sections">
          {sections.map(
            ({ id, title, description, icon: Icon }) => (
              <button
                key={id}
                className={`settings-section ${
                  activeSection === id
                    ? "active"
                    : ""
                }`}
                onClick={() => openSection(id)}
              >
                <div className="settings-section-icon">
                  <Icon size={26} />
                </div>

                <div className="settings-section-content">
                  <h2>{title}</h2>

                  <p>
                    {description}
                  </p>
                </div>

                <ArrowLeft
                  size={19}
                  className="settings-section-arrow"
                />
              </button>
            )
          )}
        </div>

        {activeSection === "workspace" && (
          <div className="settings-panel">
            <div className="settings-panel-header">
              <div>
                <span className="eyebrow">
                  WORKSPACE
                </span>

                <h2>
                  Workspace configuration
                </h2>
              </div>

              <button
                className="settings-panel-close"
                onClick={closeSection}
              >
                <X size={18} />
              </button>
            </div>

            <div className="settings-panel-body">
              <div className="settings-option">
                <div>
                  <strong>
                    Automatic refresh
                  </strong>

                  <p>
                    Automatically refresh repository
                    information when the workspace opens.
                  </p>
                </div>

                <button
                  className={`settings-toggle ${
                    workspaceSettings.autoRefresh
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    toggleWorkspaceSetting(
                      "autoRefresh"
                    )
                  }
                  aria-label="Toggle automatic refresh"
                >
                  <span />
                </button>
              </div>

              <div className="settings-option">
                <div>
                  <strong>
                    Automatic indexing
                  </strong>

                  <p>
                    Enable repository indexing after
                    adding a new repository.
                  </p>
                </div>

                <button
                  className={`settings-toggle ${
                    workspaceSettings.autoIndex
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    toggleWorkspaceSetting(
                      "autoIndex"
                    )
                  }
                  aria-label="Toggle automatic indexing"
                >
                  <span />
                </button>
              </div>

              <button className="settings-save-button">
                <Save size={17} />
                Save workspace settings
              </button>
            </div>
          </div>
        )}

        {activeSection === "integration" && (
          <div className="settings-panel">
            <div className="settings-panel-header">
              <div>
                <span className="eyebrow">
                  INTEGRATION
                </span>

                <h2>
                  Repository Integration
                </h2>
              </div>

              <button
                className="settings-panel-close"
                onClick={closeSection}
              >
                <X size={18} />
              </button>
            </div>

            <div className="settings-panel-body">
              <div className="settings-option">
                <div>
                  <strong>
                    GitHub integration
                  </strong>

                  <p>
                    Allow CodeScope to connect to public
                    GitHub repositories.
                  </p>
                </div>

                <button
                  className={`settings-toggle ${
                    integrationSettings.githubEnabled
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    toggleIntegrationSetting(
                      "githubEnabled"
                    )
                  }
                  aria-label="Toggle GitHub integration"
                >
                  <span />
                </button>
              </div>

              <div className="settings-option">
                <div>
                  <strong>
                    Automatic repository analysis
                  </strong>

                  <p>
                    Start repository analysis after a
                    repository has been connected.
                  </p>
                </div>

                <button
                  className={`settings-toggle ${
                    integrationSettings.autoAnalyze
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    toggleIntegrationSetting(
                      "autoAnalyze"
                    )
                  }
                  aria-label="Toggle automatic repository analysis"
                >
                  <span />
                </button>
              </div>

              <button
                className="settings-save-button"
                onClick={() =>
                  setActiveSection(null)
                }
              >
                <Check size={17} />
                Save integration settings
              </button>
            </div>
          </div>
        )}

        {activeSection === "documentation" && (
          <div className="settings-panel">
            <div className="settings-panel-header">
              <div>
                <span className="eyebrow">
                  DOCUMENTATION
                </span>

                <h2>
                  Documentation
                </h2>
              </div>

              <button
                className="settings-panel-close"
                onClick={closeSection}
              >
                <X size={18} />
              </button>
            </div>

            <div className="settings-panel-body">
              <div className="settings-documentation">
                <div className="settings-documentation-icon">
                  <FileText size={25} />
                </div>

                <div>
                  <strong>
                    Additional repository documentation
                  </strong>

                  <p>
                    Upload a PDF document that contains
                    additional information about your
                    repository and use it as context when
                    asking questions.
                  </p>

                  <button
                    className="settings-upload-button"
                    onClick={onDocumentation}
                  >
                    <FileText size={17} />
                    Upload Documentation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}