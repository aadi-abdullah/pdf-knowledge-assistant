from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ── Document Models ──────────────────────────────────────────────────────────

class DocumentInfo(BaseModel):
    doc_id: str
    filename: str
    page_count: int
    chunk_count: int
    uploaded_at: str


class UploadResponse(BaseModel):
    success: bool
    message: str
    document: Optional[DocumentInfo] = None


class DeleteResponse(BaseModel):
    success: bool
    message: str


# ── Chat Models ───────────────────────────────────────────────────────────────

class Source(BaseModel):
    doc_id: str
    filename: str
    page: int
    chunk_text: str
    score: float


class ChatRequest(BaseModel):
    question: str
    doc_id: Optional[str] = None   # None = search across all docs
    chat_history: list[dict] = []


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]
    model_used: str
    tokens_used: Optional[int] = None
