import { useState } from "react";
import {
  ChevronDown,
  FileCode2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function getLanguage(path = "", sourceType = "") {
  const value = path.toLowerCase();

  if (value.endsWith(".py")) return "python";
  if (
    value.endsWith(".js") ||
    value.endsWith(".jsx")
  ) {
    return "javascript";
  }
  if (
    value.endsWith(".ts") ||
    value.endsWith(".tsx")
  ) {
    return "typescript";
  }
  if (value.endsWith(".json")) return "json";
  if (
    value.endsWith(".yaml") ||
    value.endsWith(".yml")
  ) {
    return "yaml";
  }
  if (value.endsWith(".css")) return "css";
  if (
    value.endsWith(".html") ||
    value.endsWith(".htm")
  ) {
    return "markup";
  }
  if (value.endsWith(".sql")) return "sql";
  if (
    value.endsWith(".md") ||
    value.endsWith(".mdx")
  ) {
    return "markdown";
  }
  if (
    value.endsWith(".sh") ||
    value.endsWith(".bash")
  ) {
    return "bash";
  }

  if (sourceType === "document") {
    return "markdown";
  }

  return "text";
}

function isMarkdownFile(
  path = "",
  sourceType = ""
) {
  const value = path.toLowerCase();

  return (
    value.endsWith(".md") ||
    value.endsWith(".mdx") ||
    sourceType === "document"
  );
}

function MarkdownEvidence({ evidence }) {
  return (
    <div className="source-markdown-viewer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1>{children}</h1>
          ),

          h2: ({ children }) => (
            <h2>{children}</h2>
          ),

          h3: ({ children }) => (
            <h3>{children}</h3>
          ),

          h4: ({ children }) => (
            <h4>{children}</h4>
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

          li: ({ children }) => (
            <li>{children}</li>
          ),

          strong: ({ children }) => (
            <strong>{children}</strong>
          ),

          em: ({ children }) => (
            <em>{children}</em>
          ),

          blockquote: ({ children }) => (
            <blockquote>
              {children}
            </blockquote>
          ),

          hr: () => <hr />,

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),

          code: ({
            inline,
            className,
            children,
          }) => {
            if (inline) {
              return (
                <code className="source-inline-code">
                  {children}
                </code>
              );
            }

            const language =
              className
                ?.replace("language-", "")
                .toLowerCase() || "text";

            const code = String(
              children
            ).replace(/\n$/, "");

            return (
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: "14px 0",
                  padding: "13px 14px",
                  borderRadius: "8px",
                  background: "#020914",
                  fontSize: "10px",
                  lineHeight: 1.65,
                }}
                wrapLongLines={false}
                PreTag="pre"
                CodeTag="code"
              >
                {code}
              </SyntaxHighlighter>
            );
          },

          table: ({ children }) => (
            <div className="source-markdown-table-wrap">
              <table>
                {children}
              </table>
            </div>
          ),

          thead: ({ children }) => (
            <thead>{children}</thead>
          ),

          tbody: ({ children }) => (
            <tbody>{children}</tbody>
          ),

          tr: ({ children }) => (
            <tr>{children}</tr>
          ),

          th: ({ children }) => (
            <th>{children}</th>
          ),

          td: ({ children }) => (
            <td>{children}</td>
          ),
        }}
      >
        {evidence}
      </ReactMarkdown>
    </div>
  );
}

function CodeEvidence({
  evidence,
  language,
}) {
  return (
    <div className="source-code-viewer">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "14px",
          background: "transparent",
          fontSize: "11px",
          lineHeight: 1.65,
          minWidth: "100%",
        }}
        wrapLongLines={false}
        PreTag="pre"
        CodeTag="code"
      >
        {evidence}
      </SyntaxHighlighter>
    </div>
  );
}

export default function SourceList({
  sources = [],
}) {
  const [open, setOpen] = useState(false);
  const [openSources, setOpenSources] =
    useState({});

  if (!sources.length) {
    return null;
  }

  const toggleSource = (index) => {
    setOpenSources((current) => ({
      ...current,
      [index]: !current[index],
    }));
  };

  return (
    <div className="sources">
      <button
        type="button"
        className={`sources-toggle ${
          open ? "open" : ""
        }`}
        onClick={() =>
          setOpen((current) => !current)
        }
      >
        <span className="sources-toggle-left">
          <FileCode2 size={15} />

          <span>Sources used</span>

          <span className="sources-count">
            {sources.length}
          </span>
        </span>

        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="sources-list">
          {sources.map((source, index) => {
            const isObject =
              source &&
              typeof source === "object";

            const fileName =
              typeof source === "string"
                ? source
                : source?.file_name ||
                  source?.relative_path ||
                  "Source";

            const relativePath = isObject
              ? source?.relative_path || ""
              : "";

            const sourceType = isObject
              ? source?.source_type || ""
              : "";

            const evidence = isObject
              ? source?.evidence || ""
              : "";

            const expanded =
              !!openSources[index];

            const filePath =
              relativePath || fileName;

            const markdown =
              isMarkdownFile(
                filePath,
                sourceType
              );

            const language =
              getLanguage(
                filePath,
                sourceType
              );

            return (
              <div
                className={`source-item ${
                  expanded
                    ? "expanded"
                    : ""
                }`}
                key={`${fileName}-${index}`}
              >
                <button
                  type="button"
                  className="source-item-toggle"
                  onClick={() =>
                    toggleSource(index)
                  }
                >
                  <span className="source-item-left">
                    <span className="source-index">
                      {index + 1}
                    </span>

                    <span className="source-file-copy">
                      <strong>
                        {fileName}
                      </strong>

                      {relativePath &&
                        relativePath !==
                          fileName && (
                          <small>
                            {relativePath}
                          </small>
                        )}
                    </span>
                  </span>

                  <span className="source-item-right">
                    {sourceType && (
                      <span className="source-type">
                        {sourceType}
                      </span>
                    )}

                    <ChevronDown size={15} />
                  </span>
                </button>

                {expanded && evidence && (
                  <div className="source-evidence">
                    <div className="source-evidence-title">
                      Evidence
                    </div>

                    {markdown ? (
                      <MarkdownEvidence
                        evidence={evidence}
                      />
                    ) : (
                      <CodeEvidence
                        evidence={evidence}
                        language={language}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}