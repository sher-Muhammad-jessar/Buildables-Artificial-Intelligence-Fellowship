# backend/vector_store.py
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List

# Single global embedder and index
EMBEDDER = SentenceTransformer("all-MiniLM-L6-v2")
DIM = EMBEDDER.get_sentence_embedding_dimension()

# We'll use inner product on normalized vectors for cosine similarity
_index = faiss.IndexFlatIP(DIM)
_documents = []  # list of {"text":..., "source":...}

def _normalize(vec: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vec, axis=1, keepdims=True) + 1e-10
    return vec / norms

def add_text(text: str, source: str = "notes"):
    vec = EMBEDDER.encode([text], convert_to_numpy=True)
    vec = _normalize(vec).astype("float32")
    _index.add(vec)
    _documents.append({"text": text, "source": source})

def add_texts_bulk(texts: List[str], source: str = "notes"):
    if not texts:
        return
    vecs = EMBEDDER.encode(texts, convert_to_numpy=True)
    vecs = _normalize(vecs).astype("float32")
    _index.add(vecs)
    for t in texts:
        _documents.append({"text": t, "source": source})

def search(query: str, top_k: int = 3):
    if len(_documents) == 0 or _index.ntotal == 0:
        return []
    q = EMBEDDER.encode([query], convert_to_numpy=True)
    q = _normalize(q).astype("float32")
    distances, indices = _index.search(q, top_k)
    results = []
    for idx in indices[0]:
        if idx < len(_documents):
            results.append(_documents[idx])
    return results

def count():
    return len(_documents)
