import {
  Blocks,
  GitBranch,
  Search,
  Sparkles,
} from "lucide-react";

export default function SuggestionCards({
  onSelect,
}) {
  const suggestions = [
    {
      icon: Sparkles,
      label: "Explain this project",
      prompt:
        "Can you give me an overview of this project?",
    },
    {
      icon: Blocks,
      label: "Show the architecture",
      prompt:
        "Can you explain the architecture of this project?",
    },
    {
      icon: GitBranch,
      label: "Trace the main flow",
      prompt:
        "Can you trace the main execution flow of this project?",
    },
    {
      icon: Search,
      label: "Find key components",
      prompt:
        "What are the most important components and files in this project?",
    },
  ];

  return (
    <div className="suggestion-cards">
      {suggestions.map(
        ({
          icon: Icon,
          label,
          prompt,
        }) => (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(prompt)}
          >
            <span className="suggestion-icon">
              <Icon size={17} />
            </span>

            <span className="suggestion-copy">
              <strong>{label}</strong>
              <small>Ask CodeScope AI</small>
            </span>
          </button>
        )
      )}
    </div>
  );
}