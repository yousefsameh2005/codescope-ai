import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";

const steps = ["Cloning repository", "Reading files", "Creating embeddings", "Indexing", "Finalizing"];

export default function ProcessingView({ currentStep = 2 }) {
  return (
    <div className="processing-card">
      <h2>Processing your repository</h2>
      <p>This may take a few moments.</p>
      <div className="processing-steps">
        {steps.map((step, index) => {
          const state = index < currentStep ? "done" : index === currentStep ? "active" : "pending";
          return (
            <div className={`processing-step ${state}`} key={step}>
              {state === "done" ? <CheckCircle2 size={15} /> : state === "active" ? <LoaderCircle className="spin" size={15} /> : <Circle size={15} />}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
      <small>This will only happen once.</small>
    </div>
  );
}