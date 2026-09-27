import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function ChatContainer({
  messages,
  loading,
  onSend,
  empty,
}) {
  const scrollRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = (behavior = "smooth") => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    element.scrollTo({
      top: element.scrollHeight,
      behavior,
    });
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, loading]);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const handleScroll = () => {
      const distanceFromBottom =
        element.scrollHeight -
        element.scrollTop -
        element.clientHeight;

      setShowScrollButton(distanceFromBottom > 220);
    };

    handleScroll();
    element.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      element.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  return (
      <section
       className={`chat-area ${
       empty ? "chat-area-empty" : ""
       }`}
       >
      <div
        className="chat-scroll"
        ref={scrollRef}
      >
        {messages.length > 0 && (
          <div className="chat-messages">
            {messages.map((message, index) => (
              <ChatMessage
                key={`${message.role}-${index}`}
                message={message}
              />
            ))}

            {loading && (
              <div className="typing-row">
                <div className="assistant-avatar">
                  <span>⌘</span>
                </div>

                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="chat-surface-spacer" />
        )}
      </div>

      {showScrollButton && (
        <button
          type="button"
          className="chat-scroll-button"
          onClick={() => scrollToBottom("smooth")}
          aria-label="Scroll to latest message"
        >
          <ArrowDown size={16} />
        </button>
      )}

      <ChatInput
        onSend={onSend}
        disabled={loading}
      />
    </section>
  );
}