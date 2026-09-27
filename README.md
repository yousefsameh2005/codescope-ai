# CodeScope AI

**AI-Powered Codebase Analysis & Question Answering**

CodeScope AI is an AI-powered code intelligence platform that allows developers to explore software repositories and ask natural-language questions about their code.

Instead of manually searching through large codebases, CodeScope indexes repository source code, retrieves the most relevant code for a given question, reranks the retrieved candidates, and uses the selected context to generate a repository-aware answer with Google Gemini.

---

## 1. Project Overview

CodeScope AI is a Retrieval-Augmented Generation (RAG) system built around software repositories.

The system is designed to answer questions about an existing codebase by grounding the LLM response in the actual source code retrieved from the selected repository.

The main pipeline combines:

- Repository management
- Source-code loading and filtering
- Code chunking
- Semantic retrieval
- Keyword retrieval
- Reciprocal Rank Fusion (RRF)
- Cross-encoder reranking
- Persistent vector storage
- LLM-based answer generation

The project consists of a FastAPI backend responsible for repository processing, indexing, retrieval, and generation, together with a React/Vite frontend used to interact with repositories and ask questions.

---

## 2. Key Features

- **Repository Management** — Add and manage multiple software repositories.

- **Natural Language Code Q&A** — Ask questions about a repository using natural language.

- **Code Indexing** — Loads and processes source-code files before storing them for retrieval.

- **Hybrid Retrieval** — Combines semantic search with keyword-based retrieval.

- **Reciprocal Rank Fusion (RRF)** — Combines retrieval rankings to produce a stronger candidate set.

- **Cross-Encoder Reranking** — Re-ranks retrieved code candidates according to their relevance to the question.

- **RAG-Based Generation** — Uses retrieved source code as context before generating the final answer.

- **Persistent Vector Storage** — Stores code embeddings in ChromaDB for persistent retrieval.

- **Gemini Integration** — Uses Google Gemini for answer generation.

- **Model & API Fallback** — Supports multiple Gemini models and API keys for handling supported API failures.

- **Repository-Aware Answers** — Answers are generated using context retrieved from the selected repository rather than relying only on the LLM's general knowledge.

---

## 3. System Architecture

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI + Uvicorn |
| Vector Store | ChromaDB |
| Embeddings | `intfloat/multilingual-e5-small` |
| Reranker | `cross-encoder/ms-marco-MiniLM-L-6-v2` |
| LLM | Google Gemini |
| Retrieval | Semantic + Keyword |
| Ranking Fusion | Reciprocal Rank Fusion (RRF) |

The frontend communicates with the FastAPI backend through HTTP APIs.

Repository management, indexing, retrieval, reranking, and LLM generation are handled by the backend.

---

## 4. End-to-End RAG Pipeline

```text
Repository
    ↓
Code Loading & Filtering
    ↓
Document Creation
    ↓
Code Chunking
    ↓
Embedding Generation
    ↓
ChromaDB
    ↓
User Question
    ↓
Semantic Search + Keyword Search
    ↓
File-Level Fusion / RRF
    ↓
Candidate Code Chunks
    ↓
Cross-Encoder Reranking
    ↓
Top Relevant Code
    ↓
Context Construction
    ↓
Google Gemini
    ↓
Final Answer
```

The retrieval pipeline is intentionally separated from the generation layer so that the system can focus on finding relevant code before asking the LLM to reason over it.

---

## 5. Repository Ingestion

When a repository is added to CodeScope, the backend processes its source code before it becomes available for question answering.

The ingestion flow is:

```text
Repository
    ↓
Load Source Files
    ↓
Filter Unnecessary Files
    ↓
Create Documents
    ↓
Split Into Chunks
    ↓
Generate Embeddings
    ↓
Store in ChromaDB
```

The code loader excludes unnecessary or generated content such as:

- `.git`
- `node_modules`
- virtual environments
- build directories
- distribution directories
- Python cache directories
- environment files
- binary content
- generated dependency files

This keeps the indexed dataset focused on the actual source code.

---

## 6. Code Chunking

Large source files are split into smaller chunks before embedding.

CodeScope uses recursive character-based chunking with overlapping context.

| Parameter | Value |
|---|---:|
| Chunk Size | 1000 characters |
| Chunk Overlap | 150 characters |

The overlap helps preserve contextual information between neighboring chunks while keeping individual retrieval units small enough for efficient search.

---

## 7. Embedding Model

CodeScope uses:

**Model:** `intfloat/multilingual-e5-small`

The embedding model converts source-code chunks and user queries into vector representations that can be compared during semantic retrieval.

E5-style prefixes are applied during embedding:

- `passage:` for indexed code
- `query:` for user questions

Embeddings are normalized before being stored and queried.

---

## 8. Vector Database

CodeScope uses **ChromaDB** as its persistent vector database.

**Storage:**

`data/chroma_db/`

The vector store is responsible for storing the embeddings and metadata required for semantic retrieval.

The application maintains the vector database separately from the original repository source files and indexing state.

---

## 9. Hybrid Retrieval

A major part of CodeScope's retrieval architecture is the combination of two complementary retrieval strategies.

### Semantic Search

Semantic retrieval finds code that is conceptually related to the user's question, even when the exact wording is different.

For example, a question about:

> How does the application authenticate users?

may retrieve code containing concepts such as authentication middleware, token validation, login handlers, or session management even if the exact phrase does not appear in the source code.

### Keyword Search

Keyword retrieval provides an additional signal for exact technical matches.

It is particularly useful for:

- Function names
- Class names
- Variable names
- API endpoints
- File names
- Technical identifiers

Combining both approaches improves the diversity and recall of the candidate set.

---

## 10. Retrieval Fusion

The semantic and keyword results are combined using **Reciprocal Rank Fusion (RRF)**.

```text
Semantic Search
       +
Keyword Search
       ↓
   RRF Fusion
       ↓
Combined Candidate Ranking
       ↓
Candidate Code Chunks
```

The system first retrieves a broader candidate set and then applies additional ranking before selecting the final context.

Current retrieval configuration includes:

| Parameter | Value |
|---|---:|
| Initial Retrieval K | 40 |
| Top Files | 8 |
| Candidates per File | 4 |
| Final Results | 6 |
| RRF Constant | 60 |

---

## 11. File-Level Retrieval

CodeScope performs file-level fusion before selecting the final code chunks.

Instead of treating every retrieved chunk as completely independent, the system uses retrieval results to identify relevant files and then collects candidate chunks from those files.

This helps preserve file-level context and improves candidate diversity before the reranking stage.

---

## 12. Cross-Encoder Reranking

The initial retrieval stage is optimized for finding a broad set of potentially relevant candidates.

CodeScope then uses a cross-encoder reranker to perform a more focused relevance comparison.

**Reranker:**

`cross-encoder/ms-marco-MiniLM-L-6-v2`

The reranker receives:

```text
User Question
      +
Candidate Code Chunks
      ↓
Cross-Encoder
      ↓
Relevance Scores
      ↓
Top Relevant Chunks
```

The final ranked candidates are used as the context provided to the LLM.

This creates a two-stage retrieval architecture:

```text
First Stage
High Recall
    ↓
Candidate Retrieval
    ↓
Second Stage
Higher Precision
    ↓
Reranking
```

---

## 13. LLM Layer

CodeScope uses Google Gemini for answer generation through the LangChain Google GenAI integration.

The LLM receives the user's question together with the most relevant retrieved code and generates an answer based on that context.

The generation layer is separated from the retrieval system, allowing the retrieval architecture to remain independent of the selected Gemini model.

---

## 14. Gemini Model & API Fallback

CodeScope supports configuring multiple Gemini API keys and models through environment variables.

```text
GEMINI_API_KEY_1
GEMINI_API_KEY_2
GEMINI_API_KEY_3
GEMINI_API_KEY_4
GEMINI_API_KEY_5

GEMINI_MODEL_PRIMARY
GEMINI_MODEL_FALLBACK_1
GEMINI_MODEL_FALLBACK_2
```

When supported API errors occur, the application can attempt another configured key or model according to the fallback logic.

This provides additional resilience when communicating with the external LLM service.

---

## 15. Model Caching

The embedding and reranking models are initialized once and reused during the lifetime of the backend process.

The embedding model uses an in-memory cache, while the reranker maintains a single loaded model instance.

This prevents the application from recreating the models for every request.

The underlying Hugging Face model files are also cached locally after the initial download.

---

## 16. Frontend

The CodeScope frontend is built using:

- React
- Vite
- JavaScript
- CSS

The frontend provides the user interface for:

- Managing repositories
- Selecting repositories
- Asking questions
- Viewing generated answers
- Interacting with the CodeScope workspace

The frontend communicates with the FastAPI backend through HTTP requests.

---

## 17. Project Structure

```text
CodeScope AI/
│
├── app/
│   ├── api/
│   │   └── routes/
│   │
│   ├── loaders/
│   │   └── code_loader.py
│   │
│   ├── processors/
│   │   └── code_chunker.py
│   │
│   └── services/
│       ├── file_state.py
│       ├── indexer.py
│       ├── rag_chain.py
│       ├── repository_manager.py
│       ├── retriever.py
│       ├── reranker.py
│       └── vector_store.py
│
├── codescope-frontend/
│   └── src/
│
├── data/
│   ├── chroma_db/
│   ├── repositories/
│   ├── repositories_data/
│   └── uploads/
│
├── .gitignore
├── import_log.txt
├── reindex_all.py
└── README.md
```

Runtime data directories are intentionally excluded from version control where appropriate.

---

## 18. API

The FastAPI backend exposes endpoints for repository management and repository question answering.

The main workflow is:

```text
Create / Add Repository
        ↓
Repository Indexing
        ↓
Vector Store
        ↓
Select Repository
        ↓
Ask Question
        ↓
Retrieve Relevant Code
        ↓
Generate Answer
```

FastAPI also provides automatic interactive API documentation through:

`/docs`

---

## 19. Getting Started

### Prerequisites

Make sure you have:

- Python 3.10+
- Node.js
- npm
- Google Gemini API key

### Clone the Repository

```bash
git clone https://github.com/yousefsameh2005/codescope-ai.git
cd codescope-ai
```

### Backend Setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Install the required Python dependencies.

### Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY_1=your_api_key
GEMINI_API_KEY_2=your_api_key
GEMINI_API_KEY_3=your_api_key
GEMINI_API_KEY_4=your_api_key
GEMINI_API_KEY_5=your_api_key

GEMINI_MODEL_PRIMARY=your_model
GEMINI_MODEL_FALLBACK_1=your_model
GEMINI_MODEL_FALLBACK_2=your_model
```

Never commit `.env` or expose API keys publicly.

---

## 20. How to Run

### Backend

From the project root:

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

`http://127.0.0.1:8000`

FastAPI documentation:

`http://127.0.0.1:8000/docs`

### Frontend

Open another terminal:

```bash
cd codescope-frontend
npm install
npm run dev
```

The frontend will then be available through the Vite development server.

---

## 21. Example Questions

CodeScope can be used for questions such as:

- Where is authentication implemented?
- How does this API endpoint work?
- Which file handles database connections?
- Where is this function defined?
- How does this feature work across the repository?
- Which files are responsible for a specific behavior?
- What is the purpose of this module?
- Where is a specific class or component used?

---

## 22. Engineering Highlights

CodeScope is designed as more than a simple LLM chatbot.

### Hybrid Retrieval

Semantic search and keyword retrieval are combined instead of relying on a single retrieval method.

### Retrieval Fusion

RRF combines the rankings produced by different retrieval strategies before final candidate selection.

### Two-Stage Retrieval

A broader retrieval stage is followed by a dedicated cross-encoder reranking stage.

### Repository-Aware Generation

The LLM receives retrieved code from the selected repository as context rather than being asked to answer purely from general knowledge.

### Persistent Storage

Repository embeddings are stored persistently in ChromaDB instead of being recreated for every application request.

### Model Reuse

Embedding and reranking models are cached during the backend process to avoid unnecessary model initialization.

### Configurable LLM Layer

Gemini models and API keys can be configured through environment variables, with fallback support for supported failures.

---

## 23. Current Architecture

```text
                        ┌──────────────────────┐
                        │       Frontend       │
                        │     React + Vite      │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │       FastAPI        │
                        │       Backend        │
                        └──────────┬───────────┘
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      Repository              Retrieval              RAG Chain
      Management               Pipeline                   │
             │                     │                     │
             ▼                     ▼                     ▼
        Source Code       Semantic + Keyword         Gemini
                               Search                   │
                                  │                     │
                                  ▼                     │
                              RRF Fusion                │
                                  │                     │
                                  ▼                     │
                              Reranker                  │
                                  │                     │
                                  ▼                     │
                              ChromaDB ◄───────────────┘
```

---

## 24. Future Improvements

- AST-based code understanding
- Function and class-level retrieval
- Repository dependency analysis
- Improved retrieval evaluation
- Query rewriting and multi-query retrieval
- Git history and commit-aware analysis
- Context compression
- Authentication and user management
- Repository-level access control
- Docker-based deployment
- Cloud deployment
- Retrieval and system observability

---

## 25. Project Goal

The long-term goal of CodeScope AI is to evolve into a complete AI-powered code intelligence platform that helps developers understand, navigate, and analyze unfamiliar software repositories.

The current system establishes the foundation through:

**Code Indexing + Hybrid Retrieval + RRF + Reranking + RAG + LLM Generation**

---
## 👨‍💻 Author

**Yousef Sameh**

GitHub: [@yousefsameh2005](https://github.com/yousefsameh2005/codescope-ai)

---

⭐ If you find CodeScope AI interesting, feel free to explore the repository.