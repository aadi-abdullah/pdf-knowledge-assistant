import logging

from fastapi import APIRouter, Depends, HTTPException

from app.models import ChatRequest, ChatResponse
from app.services.rag_engine import RAGEngine
from app.services.vector_store import VectorStoreService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Chat"])

_rag_engine = None

def get_rag_engine() -> RAGEngine:
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = RAGEngine(VectorStoreService())
    return _rag_engine


@router.post("/", response_model=ChatResponse, summary="Ask a question about your documents")
async def chat(
    request: ChatRequest,
    rag: RAGEngine = Depends(get_rag_engine),
):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    try:
        response = rag.answer(request)
        return response
    except Exception as e:
        logger.exception("RAG pipeline error")
        raise HTTPException(status_code=500, detail=f"Answer generation failed: {str(e)}")


@router.get("/health", summary="Check service health")
async def health():
    return {"status": "ok", "service": "PDF Knowledge Assistant"}