import { useMemo } from "react";
import { useChat } from "../hooks/useChat";
import Sidebar from "../components/layout/Sidebar";
import ChatContainer from "../components/chat/ChatContainer";
import SuggestionCards from "../components/chat/SuggestionCards";
import { Code2, Plus, RefreshCw } from "lucide-react";

export default function Workspace({
  repository,
  repositories,
  onSelectRepository,
  onAddRepository,
  onRefresh,
}) {
  const {
    chats,
    currentChatId,
    messages,
    loading,
    sendQuestion,
    newChat,
    selectChat,
  } = useChat(repository?.id || repository?.name);

  const suggestedSend = (prompt) => sendQuestion(prompt);

  const ready = repository?.status !== "processing";

  const repositoryName = useMemo(
    () => repository?.name || "Repository",
    [repository]
  );

  return (
    <div className="workspace-page">
      <header className="workspace-topbar">
        <div className="brand">
          <div className="brand-mark">
            <Code2 size={19} />
          </div>

          <span>CodeScope</span>
        </div>

        <div className="topbar-actions">
          <button
            className="header-button secondary"
            onClick={onRefresh}
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            className="header-button primary"
            onClick={onAddRepository}
          >
            <Plus size={19} />
            Add Repository
          </button>
        </div>
      </header>

      <div className="workspace-body">
        <Sidebar
          repositories={repositories}
          selectedRepository={repository}
          onSelectRepository={onSelectRepository}
          onAddRepository={onAddRepository}
        />

        <main className="workspace-main">
          <div className="workspace-heading">
            <div>
              <span className="workspace-label">
                Repository
              </span>

              <h1>{repositoryName}</h1>
            </div>

            <span
              className={`ready-pill ${
                ready ? "" : "processing"
              }`}
            >
              <span />

              {ready ? "Ready" : "Processing"}
            </span>
          </div>

          {!messages.length && (
            <>
              <div className="workspace-hero">
                <div className="eyebrow">
                  AI POWERED REPOSITORY INTELLIGENCE
                </div>

                <h2>
                  Understand your codebase{" "}
                  <span>in seconds.</span>
                </h2>

                <p>
                  Ask questions about your repository,
                  explore architecture,
                  <br />
                  understand code, and discover how
                  everything works.
                </p>
              </div>

              <SuggestionCards
                onSelect={suggestedSend}
              />
            </>
          )}

        <ChatContainer
          messages={messages}
          loading={loading}
          onSend={sendQuestion}
          empty={!messages.length}
        />
        </main>
      </div>
    </div>
  );
}