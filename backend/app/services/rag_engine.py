import logging
from typing import Optional

from groq import Groq

from app.config import get_settings
from app.models import ChatRequest, ChatResponse, Source
from app.services.vector_store import VectorStoreService

logger = logging.getLogger(__name__)
settings = get_settings()

# ── Prompt Template ───────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an intelligent document assistant. Your job is to answer questions \
accurately using ONLY the provided context from the user's PDF documents.

Rules:
- Answer strictly from the context. Do not fabricate or guess.
- If the context does not contain enough information, say so clearly.
- Be concise yet thorough. Use bullet points or numbered lists when helpful.
- When referencing specific information, mention the page number if available.
- Do not repeat the question back to the user."""

CONTEXT_TEMPLATE = """
RELEVANT CONTEXT FROM DOCUMENTS:
{context}

CONVERSATION HISTORY:
{history}

USER QUESTION: {question}

Provide a clear, accurate answer based solely on the context above.
"""


class RAGEngine:
    """
    Retrieval-Augmented Generation engine.
    Orchestrates: vector search → context assembly → Groq LLM answer.
    """

    def __init__(self, vector_store: VectorStoreService):
        self.vector_store = vector_store
        self.client = Groq(api_key=settings.groq_api_key)

    def _format_context(self, results: list[dict]) -> str:
        """Format retrieved chunks into a numbered context block."""
        if not results:
            return "No relevant context found."

        lines = []
        for i, result in enumerate(results, 1):
            meta = result["metadata"]
            filename = meta.get("filename", "Unknown")
            page = meta.get("page", "?")
            score = result["score"]
            lines.append(
                f"[{i}] Source: {filename}, Page {page} (relevance: {score:.2f})\n"
                f"{result['text']}"
            )
        return "\n\n---\n\n".join(lines)

    def _format_history(self, history: list[dict]) -> str:
        """Format previous chat turns for context injection."""
        if not history:
            return "None"
        lines = []
        for turn in history[-6:]:   # last 3 exchanges
            role = "User" if turn.get("role") == "user" else "Assistant"
            lines.append(f"{role}: {turn.get('content', '')}")
        return "\n".join(lines)

    def answer(self, request: ChatRequest) -> ChatResponse:
        """
        Full RAG pipeline:
          1. Retrieve relevant chunks from Pinecone
          2. Build prompt with context + history
          3. Call Groq for answer generation
          4. Return structured response with sources
        """
        # Step 1 – Retrieve
        results = self.vector_store.similarity_search(
            query=request.question,
            top_k=settings.top_k_results,
            doc_id=request.doc_id,
        )

        # Step 2 – Build prompt
        context = self._format_context(results)
        history = self._format_history(request.chat_history)
        user_message = CONTEXT_TEMPLATE.format(
            context=context,
            history=history,
            question=request.question,
        )

        # Step 3 – Generate with Groq
        completion = self.client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.2,
            max_tokens=1024,
        )

        answer_text = completion.choices[0].message.content
        tokens_used = completion.usage.total_tokens if completion.usage else None

        # Step 4 – Build sources list
        sources = []
        for result in results:
            meta = result["metadata"]
            sources.append(
                Source(
                    doc_id=meta.get("doc_id", ""),
                    filename=meta.get("filename", "Unknown"),
                    page=meta.get("page", 0),
                    chunk_text=result["text"][:300] + "..." if len(result["text"]) > 300 else result["text"],
                    score=result["score"],
                )
            )

        return ChatResponse(
            answer=answer_text,
            sources=sources,
            model_used=settings.groq_model,
            tokens_used=tokens_used,
        )
