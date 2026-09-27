import { useState } from "react";
import {
  Check,
  Copy,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import SourceList from "./SourceList";

function containsArabic(text = "") {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(
    text
  );
}

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);

  const code = String(children).replace(
    /\n$/,
    ""
  );

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);
    }
  };

  const language =
    className?.replace("language-", "") || "text";

  return (
    <div
      className="markdown-code-block"
      dir="ltr"
    >
      <div className="markdown-code-header">
        <span>{language}</span>

        <button
          type="button"
          onClick={copyCode}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} />
              Copy
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        PreTag="pre"
        customStyle={{
          margin: 0,
          maxHeight: "340px",
          overflow: "auto",
          padding: "16px 17px",
          fontSize: "12px",
          lineHeight: "1.7",
          background: "#020914",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function ChatMessage({ message }) {
  const user = message.role === "user";

  const arabic = containsArabic(
    message.content || ""
  );

  const [copied, setCopied] = useState(false);

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(
        message.content || ""
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article
      className={`message-row ${
        user
          ? "user-message"
          : "assistant-message"
      }`}
    >
      {!user && (
        <div className="assistant-avatar">
          <span>⌘</span>
        </div>
      )}

      <div className="message-column">
        <div className="message-meta">
          <span>
            {user ? "You" : "CodeScope AI"}
          </span>
        </div>

        <div
          className={`message-content ${
            arabic ? "rtl-content" : "ltr-content"
          }`}
          dir={arabic ? "rtl" : "ltr"}
        >
          {user ? (
            <p className="user-text">
              {message.content}
            </p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h2>{children}</h2>
                ),

                h2: ({ children }) => (
                  <h3>{children}</h3>
                ),

                h3: ({ children }) => (
                  <h4>{children}</h4>
                ),

                pre: ({ children }) => {
                  const codeElement =
                    children?.props;

                  return (
                    <CodeBlock
                      className={
                        codeElement?.className
                      }
                    >
                      {codeElement?.children}
                    </CodeBlock>
                  );
                },

                code: ({ children }) => (
                  <code className="inline-code">
                    {children}
                  </code>
                ),

                p: ({ children }) => (
                  <p>{children}</p>
                ),

                ul: ({ children }) => (
                  <ul>{children}</ul>
                ),

                ol: ({ children }) => (
                  <ol>{children}</ol>
                ),

                blockquote: ({
                  children,
                }) => (
                  <blockquote>
                    {children}
                  </blockquote>
                ),

                a: ({
                  href,
                  children,
                }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!user && (
          <div className="assistant-actions">
            <button
              type="button"
              onClick={copyResponse}
            >
              {copied ? (
                <>
                  <Check size={13} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={13} />
                  Copy
                </>
              )}
            </button>
          </div>
        )}

        {!user && (
          <SourceList
            sources={message.sources}
          />
        )}
      </div>
    </article>
  );
}