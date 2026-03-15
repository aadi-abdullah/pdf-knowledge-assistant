import logging
import os
import json
import numpy as np
from typing import Optional

import faiss

from app.config import get_settings
from app.services.embeddings import get_embedding_service

logger = logging.getLogger(__name__)
settings = get_settings()

FAISS_DIR = "faiss_store"
INDEX_FILE = os.path.join(FAISS_DIR, "index.faiss")
META_FILE  = os.path.join(FAISS_DIR, "metadata.json")


class VectorStoreService:
    def __init__(self):
        os.makedirs(FAISS_DIR, exist_ok=True)
        self.embedder = get_embedding_service()
        self.dimension = settings.embedding_dimension

        if os.path.exists(INDEX_FILE) and os.path.exists(META_FILE):
            self.index = faiss.read_index(INDEX_FILE)
            with open(META_FILE, "r") as f:
                self.metadata = json.load(f)
            logger.info("FAISS index loaded (%d vectors)", self.index.ntotal)
        else:
            self.index = faiss.IndexFlatIP(self.dimension)  # inner product = cosine on normalized vecs
            self.metadata = []  # list of dicts, one per vector
            logger.info("New FAISS index created")

    def _save(self):
        faiss.write_index(self.index, INDEX_FILE)
        with open(META_FILE, "w") as f:
            json.dump(self.metadata, f)

    def upsert_chunks(self, chunks: list[dict]) -> int:
        texts = [c["text"] for c in chunks]
        vectors = np.array(self.embedder.embed_texts(texts), dtype="float32")

        self.index.add(vectors)
        for chunk, vec in zip(chunks, vectors):
            self.metadata.append({
                **chunk["metadata"],
                "text": chunk["text"],
                "id": chunk["id"],
            })

        self._save()
        logger.info("Upserted %d vectors (total: %d)", len(chunks), self.index.ntotal)
        return len(chunks)

    def similarity_search(self, query: str, top_k: int = 5, doc_id: Optional[str] = None) -> list[dict]:
        if self.index.ntotal == 0:
            return []

        query_vec = np.array([self.embedder.embed_query(query)], dtype="float32")
        # Search more candidates if filtering by doc_id
        k = min(top_k * 10 if doc_id else top_k, self.index.ntotal)
        scores, indices = self.index.search(query_vec, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            meta = self.metadata[idx]
            if doc_id and meta.get("doc_id") != doc_id:
                continue
            results.append({
                "text": meta.get("text", ""),
                "score": float(round(score, 4)),
                "metadata": meta,
            })
            if len(results) >= top_k:
                break

        return results

    def delete_document(self, doc_id: str) -> bool:
        # FAISS flat index doesn't support deletion — rebuild without that doc
        keep_meta = [m for m in self.metadata if m.get("doc_id") != doc_id]
        if len(keep_meta) == len(self.metadata):
            return False  # nothing deleted

        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = []

        if keep_meta:
            texts = [m["text"] for m in keep_meta]
            vectors = np.array(self.embedder.embed_texts(texts), dtype="float32")
            self.index.add(vectors)
            self.metadata = keep_meta

        self._save()
        logger.info("Deleted doc '%s', %d vectors remain", doc_id, self.index.ntotal)
        return True

    def get_stats(self) -> dict:
        return {"total_vectors": self.index.ntotal}