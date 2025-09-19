# backend/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
from pathlib import Path
from backend import vector_store

# Load .env from project root (two levels up from backend directory)
env_path = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "llama-3.1-8b-instant")  # override via .env if needed

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found in environment. Create a .env with GROQ_API_KEY=...")

client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(title="DSA Tutor Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust for production
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/health")
def health():
    return {"status": "ok", "docs": vector_store.count()}

@app.post("/upload_file")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = content.decode("utf-8", errors="ignore")
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if not lines:
            raise HTTPException(status_code=400, detail="Uploaded file contains no text lines.")
        vector_store.add_texts_bulk(lines, source=file.filename)
        return {"message": f"Ingested {len(lines)} lines from {file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Empty message")

    docs = vector_store.search(req.message, top_k=4)
    if not docs:
        # Fallback: no docs in vector store
        messages = [
            {"role": "system", "content": "You are a helpful DSA tutor. If you don't know, say 'I don't know' and suggest next steps."},
            {"role": "user", "content": f"Question: {req.message}\n\nContext: I have no prior notes. Provide a simple, beginner-friendly answer with examples."}
        ]
    else:
        context = "\n\n".join([f"[{d['source']}]: {d['text']}" for d in docs])
        messages = [
            {"role": "system", "content": "You are a helpful DSA tutor. Keep answers short, include examples, and show complexity where relevant."},
            {"role": "user", "content": f"Question: {req.message}\n\nContext:\n{context}"}
        ]

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.2,
            max_tokens=800
        )
        answer = completion.choices[0].message.content
    except Exception as e:
        # Return friendly error
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    return {"answer": answer}
