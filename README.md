# CodeScope AI

### AI-Powered Codebase Analysis & Question Answering

CodeScope AI is an AI-powered platform that helps developers understand and interact with software repositories using natural language.

Instead of manually searching through a large codebase, developers can add a repository and ask questions about its structure, functionality, and implementation. CodeScope retrieves the most relevant code from the repository and uses it as context to generate a grounded answer.

---

## ✨ Features

- **Repository Management** — Add and manage multiple code repositories.
- **Natural Language Code Q&A** — Ask questions about a repository in plain language.
- **Hybrid Retrieval** — Combines semantic search and keyword-based search to improve code retrieval.
- **Reranking** — Uses a cross-encoder reranker to select the most relevant code from retrieved candidates.
- **RAG Pipeline** — Provides retrieved code as context to the LLM before generating an answer.
- **Persistent Vector Storage** — Stores code embeddings using ChromaDB.
- **Gemini Integration** — Uses Google Gemini for AI-powered answer generation.
- **Modern Web Interface** — React and Vite frontend for interacting with repositories.

---

## 🧠 How It Works

CodeScope AI follows a Retrieval-Augmented Generation (RAG) approach:

```text
Repository
    ↓
Code Loading & Chunking
    ↓
Embeddings
    ↓
ChromaDB
    ↓
User Question
    ↓
Semantic Search + Keyword Search
    ↓
Hybrid Retrieval / RRF
    ↓
Reranking
    ↓
Relevant Code Context
    ↓
Google Gemini
    ↓
Generated Answer

The system combines semantic and keyword retrieval to improve the chances of finding relevant code, then applies reranking before sending the final context to the LLM.

🛠️ Tech Stack
Backend
Python
FastAPI
LangChain
ChromaDB
Sentence Transformers
Hugging Face
AI & Retrieval
Google Gemini
intfloat/multilingual-e5-small
cross-encoder/ms-marco-MiniLM-L-6-v2
Semantic Search
Keyword Search
Reciprocal Rank Fusion (RRF)
Retrieval-Augmented Generation (RAG)
Frontend
React
Vite
JavaScript
CSS
📂 Project Structure
CodeScope AI/
│
├── app/
│   ├── api/
│   ├── loaders/
│   ├── processors/
│   └── services/
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
└── reindex_all.py
🚀 Getting Started
Prerequisites

Make sure you have:

Python 3.10+
Node.js
npm
A Google Gemini API key
1. Clone the Repository
git clone https://github.com/yousefsameh2005/codescope-ai.git
cd codescope-ai
2. Backend Setup

Create a virtual environment:

python -m venv .venv

Activate it on Windows:

.venv\Scripts\activate

Install the required Python dependencies.

3. Configure Environment Variables

Create a .env file in the project root:

GEMINI_API_KEY_1=your_api_key
GEMINI_API_KEY_2=your_api_key
GEMINI_API_KEY_3=your_api_key

GEMINI_MODEL_PRIMARY=your_model
GEMINI_MODEL_FALLBACK_1=your_model
GEMINI_MODEL_FALLBACK_2=your_model

Keep your API keys private and never commit the .env file to GitHub.

4. Run the Backend
uvicorn app.main:app --reload

The API will be available at:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs
5. Run the Frontend

Open another terminal:

cd codescope-frontend
npm install
npm run dev
🔍 Example Use Cases

CodeScope AI can be used to answer questions such as:

Where is authentication implemented?
How does a specific API endpoint work?
Which files handle database operations?
Where is a specific function or class defined?
How does a feature flow through the codebase?
What is the purpose of a particular module?
🎯 Project Goal

The goal of CodeScope AI is to make unfamiliar codebases easier to explore and understand by combining intelligent code retrieval with generative AI.

Rather than relying only on an LLM's general knowledge, CodeScope retrieves relevant source code from the selected repository and uses that information to generate repository-aware answers.

🔮 Future Improvements
AST-based code understanding
Function and class-level retrieval
Repository dependency analysis
Improved retrieval evaluation
Git history and commit-aware analysis
Authentication and user management
Docker and cloud deployment