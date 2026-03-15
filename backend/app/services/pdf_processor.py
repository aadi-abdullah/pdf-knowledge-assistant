import uuid
import logging
from datetime import datetime, timezone
from typing import BinaryIO

import pdfplumber

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def split_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    """Simple recursive text splitter — no langchain needed."""
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        # Try to break at a sentence or newline boundary
        if end < len(text):
            for sep in ['\n\n', '\n', '. ', ' ']:
                idx = text.rfind(sep, start, end)
                if idx != -1:
                    end = idx + len(sep)
                    break
        chunks.append(text[start:end].strip())
        start = end - chunk_overlap
    return [c for c in chunks if c]


class PDFProcessor:
    def extract_text(self, file: BinaryIO) -> tuple[list[dict], int]:
        pages = []
        with pdfplumber.open(file) as pdf:
            page_count = len(pdf.pages)
            for i, page in enumerate(pdf.pages, start=1):
                text = (page.extract_text() or "").strip()
                if text:
                    pages.append({"page": i, "text": text})
        return pages, page_count

    def create_chunks(self, pages: list[dict], doc_id: str, filename: str) -> list[dict]:
        chunks = []
        chunk_index = 0
        for page_data in pages:
            for chunk_text in split_text(page_data["text"], settings.chunk_size, settings.chunk_overlap):
                if len(chunk_text.strip()) < 30:
                    continue
                chunks.append({
                    "id": f"{doc_id}__p{page_data['page']}__c{chunk_index}",
                    "text": chunk_text,
                    "metadata": {
                        "doc_id": doc_id,
                        "filename": filename,
                        "page": page_data["page"],
                        "chunk_index": chunk_index,
                        "uploaded_at": datetime.now(timezone.utc).isoformat(),
                    },
                })
                chunk_index += 1
        return chunks

    def process(self, file: BinaryIO, filename: str) -> tuple[list[dict], str, int, int]:
        doc_id = str(uuid.uuid4())
        pages, page_count = self.extract_text(file)
        if not pages:
            raise ValueError("No extractable text found in the PDF.")
        chunks = self.create_chunks(pages, doc_id, filename)
        if not chunks:
            raise ValueError("PDF text could not be split into usable chunks.")
        return chunks, doc_id, page_count, len(chunks)
