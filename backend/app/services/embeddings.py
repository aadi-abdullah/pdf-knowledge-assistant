import logging
from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class EmbeddingService:
    """
    Wraps sentence-transformers for free, local embedding generation.
    Model: all-MiniLM-L6-v2  →  384-dim vectors, fast & accurate.
    """

    def __init__(self):
        logger.info("Loading embedding model: %s", settings.embedding_model)
        self.model = SentenceTransformer(settings.embedding_model)
        logger.info("Embedding model loaded ✓")

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Embed a list of strings. Returns list of float vectors."""
        if not texts:
            return []
        vectors = self.model.encode(
            texts,
            batch_size=64,
            show_progress_bar=False,
            normalize_embeddings=True,   # cosine similarity ready
        )
        return vectors.tolist()

    def embed_query(self, query: str) -> list[float]:
        """Embed a single query string."""
        vector = self.model.encode(
            [query],
            normalize_embeddings=True,
        )
        return vector[0].tolist()


@lru_cache(maxsize=1)
def get_embedding_service() -> EmbeddingService:
    """Singleton – model is loaded once and reused."""
    return EmbeddingService()
