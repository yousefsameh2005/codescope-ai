import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const element = textareaRef.current;

    if (!element) {
      return;
    }

    element.style.height = "auto";
    element.style.height = `${Math.min(
      element.scrollHeight,
      150
    )}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();

    if (!trimmed || disabled) {
      return;
    }

    onSend(trimmed);
    setValue("");

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="chat-composer">
      <div className="chat-input-wrap">
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          rows={1}
          placeholder="Ask anything about this repository..."
          onChange={(event) =>
            setValue(event.target.value)
          }
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <ArrowUp size={19} />
        </button>
      </div>

      <div className="chat-composer-hint">
        <span>Enter to send</span>
        <span>Shift + Enter for new line</span>
      </div>
    </div>
  );
}