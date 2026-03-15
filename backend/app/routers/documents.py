import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.models import DeleteResponse, DocumentInfo, UploadResponse
from app.services.pdf_processor import PDFProcessor
from app.services.vector_store import VectorStoreService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])

# ── In-memory document registry (replace with DB in production) ───────────────
_document_registry: dict[str, DocumentInfo] = {}

# ── Dependency Injection ──────────────────────────────────────────────────────

_vector_store = None

def get_vector_store() -> VectorStoreService:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStoreService()
    return _vector_store


def get_pdf_processor() -> PDFProcessor:
    return PDFProcessor()


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=UploadResponse, summary="Upload a PDF")
async def upload_document(
    file: UploadFile = File(...),
    vector_store: VectorStoreService = Depends(get_vector_store),
    processor: PDFProcessor = Depends(get_pdf_processor),
):
    """Upload a PDF, extract + embed its contents, and store in Pinecone."""

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    max_size_mb = 20
    contents = await file.read()
    if len(contents) > max_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {max_size_mb} MB.",
        )

    try:
        import io
        file_stream = io.BytesIO(contents)
        chunks, doc_id, page_count, chunk_count = processor.process(
            file_stream, file.filename
        )

        vector_store.upsert_chunks(chunks)

        doc_info = DocumentInfo(
            doc_id=doc_id,
            filename=file.filename,
            page_count=page_count,
            chunk_count=chunk_count,
            uploaded_at=datetime.now(timezone.utc).isoformat(),
        )
        _document_registry[doc_id] = doc_info

        return UploadResponse(
            success=True,
            message=f"Successfully processed '{file.filename}': "
                    f"{page_count} pages → {chunk_count} chunks indexed.",
            document=doc_info,
        )

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.exception("Upload failed for '%s'", file.filename)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.get("/", response_model=list[DocumentInfo], summary="List uploaded documents")
async def list_documents():
    """Return all documents currently in the registry."""
    return list(_document_registry.values())


@router.delete("/{doc_id}", response_model=DeleteResponse, summary="Delete a document")
async def delete_document(
    doc_id: str,
    vector_store: VectorStoreService = Depends(get_vector_store),
):
    """Remove all vectors for a document from Pinecone and the registry."""
    if doc_id not in _document_registry:
        raise HTTPException(status_code=404, detail="Document not found.")

    success = vector_store.delete_document(doc_id)
    if success:
        del _document_registry[doc_id]
        return DeleteResponse(success=True, message="Document deleted successfully.")
    else:
        raise HTTPException(status_code=500, detail="Failed to delete document from vector store.")
