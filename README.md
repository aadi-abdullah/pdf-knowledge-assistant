# 🧠 PDF Knowledge Assistant

> **Chat with your PDF documents using AI** — upload any PDF and ask questions in natural language. The system retrieves the most relevant sections and generates accurate, sourced answers using Retrieval-Augmented Generation (RAG).

---

## ✨ Demo

```
User:   "What are the key risk factors mentioned in this report?"
AI:     "Based on Section 3 (Page 12), the report identifies three primary risk factors:
         1. Market volatility driven by interest rate fluctuations...
         2. Regulatory changes in the APAC region...
         3. Supply chain disruptions affecting Q3 margins..."
         [Sources: annual_report.pdf · Page 12 · 94% relevance]
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React + Vite (UI)                     │
│  Upload PDF  │  Select Document  │  Chat Interface       │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                          │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────┐  │
│  │PDF Processor│───▶│  Embeddings  │───▶│  Pinecone  │  │
│  │ pdfplumber  │    │sentence-trans│    │Vector Store│  │
│  └─────────────┘    └──────────────┘    └─────┬──────┘  │
│                                               │          │
│  ┌────────────────────────────────────────────▼──────┐  │
│  │                  RAG Engine                        │  │
│  │  Query → Retrieve Chunks → Build Prompt → Groq LLM│  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Pipeline
1. **Document Processing** — PDF parsed page-by-page with `pdfplumber`
2. **Chunking** — Text split into overlapping chunks via LangChain's `RecursiveCharacterTextSplitter`
3. **Embedding** — Each chunk embedded with `all-MiniLM-L6-v2` (384-dim, free & local)
4. **Vector Storage** — Embeddings stored in Pinecone Serverless (free tier)
5. **Query** — User question embedded → cosine similarity search retrieves top-5 chunks
6. **Generation** — Groq (Llama 3.1-8B) generates grounded answer from retrieved context

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | FastAPI, Python 3.11 |
| **LLM** | Groq API — `llama-3.1-8b-instant` |
| **Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` |
| **Vector DB** | Pinecone Serverless (free tier) |
| **PDF Parsing** | pdfplumber |
| **Chunking** | LangChain Text Splitters |
| **Containers** | Docker + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- [Groq API Key](https://console.groq.com) (free)
- [Pinecone API Key](https://app.pinecone.io) (free tier)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/pdf-knowledge-assistant.git
cd pdf-knowledge-assistant
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your GROQ_API_KEY and PINECONE_API_KEY
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
```

### 4. Run the app
```bash
# Terminal 1 — Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**

### 🐳 Docker (one command)
```bash
cp backend/.env.example backend/.env  # fill in your keys
docker-compose up --build
```

---

## 📁 Project Structure

```
pdf-knowledge-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app & CORS
│   │   ├── config.py              # Pydantic settings
│   │   ├── models.py              # Request/response schemas
│   │   ├── routers/
│   │   │   ├── documents.py       # Upload / list / delete
│   │   │   └── chat.py            # RAG Q&A endpoint
│   │   └── services/
│   │       ├── pdf_processor.py   # Extract + chunk PDFs
│   │       ├── embeddings.py      # sentence-transformers
│   │       ├── vector_store.py    # Pinecone CRUD
│   │       └── rag_engine.py      # Retrieval + Groq generation
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx        # Document management
│   │   │   ├── ChatWindow.jsx     # Message list
│   │   │   ├── ChatMessage.jsx    # User/AI bubbles + markdown
│   │   │   ├── ChatInput.jsx      # Auto-grow textarea
│   │   │   └── SourceCard.jsx     # Expandable source citations
│   │   ├── hooks/
│   │   │   ├── useDocuments.js    # Upload/delete state
│   │   │   └── useChat.js         # Chat + history state
│   │   ├── api.js                 # Axios API client
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

---

## 🔑 API Reference

### Documents
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/documents/upload` | Upload and index a PDF |
| `GET` | `/api/v1/documents/` | List all indexed documents |
| `DELETE` | `/api/v1/documents/{doc_id}` | Remove a document |

### Chat
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/chat/` | Ask a question (RAG) |
| `GET` | `/api/v1/chat/health` | Health check |

Interactive API docs available at **http://localhost:8000/docs**

---

## ⚙️ Configuration

| Variable | Description | Default |
|---|---|---|
| `GROQ_API_KEY` | Groq API key | — |
| `GROQ_MODEL` | LLM model name | `llama-3.1-8b-instant` |
| `PINECONE_API_KEY` | Pinecone API key | — |
| `PINECONE_INDEX_NAME` | Index name | `pdf-rag-index` |
| `CHUNK_SIZE` | Chars per chunk | `800` |
| `CHUNK_OVERLAP` | Overlap between chunks | `150` |
| `TOP_K_RESULTS` | Chunks retrieved per query | `5` |

---

## 🗺️ Roadmap

- [ ] Streaming responses (SSE)
- [ ] Multi-file upload support
- [ ] Persistent document registry (PostgreSQL)
- [ ] Authentication (JWT)
- [ ] Deploy to Railway / Render

---

## 📄 License

MIT — free to use, modify, and share.

---

*Built to demonstrate production-grade RAG architecture for AI engineering portfolios.*
