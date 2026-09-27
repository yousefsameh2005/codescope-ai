import { useEffect } from "react";
import { Code2 } from "lucide-react";
import ProcessingView from "../components/processing/ProcessingView";
import { useRepositoryStatus } from "../hooks/useRepositoryStatus";

const stageMap = {
  cloning: 0,
  reading_files: 1,
  creating_documents: 2,
  chunking: 3,
  indexing: 4,
  finalizing: 5,
  ready: 5,
};

export default function Processing({
  repository,
  onComplete,
}) {
  const {
    status,
    progress,
    error,
  } = useRepositoryStatus(repository?.id);

  useEffect(() => {
    if (status === "ready") {
      onComplete();
    }
  }, [status, onComplete]);

  const currentStep = stageMap[status] ?? 0;

  return (
    <div className="processing-page">
      <div className="mini-brand">
        <div className="brand-mark">
          <Code2 size={16} />
        </div>

        <span>CodeScope</span>
      </div>

      <ProcessingView
        currentStep={currentStep}
        status={status}
        progress={progress}
      />

      <div className="processing-status">
        {error
          ? error
          : status === "ready"
            ? "Processing complete. Opening workspace..."
            : "Processing your repository..."}
      </div>
    </div>
  );
}

