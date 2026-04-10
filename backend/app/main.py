import os
from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env (Windows-safe absolute path)
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

from .agent import run_agent
from .tools.metrics import get_metrics_and_signals
from .search import router as search_router

app = FastAPI()

class AgentRequest(BaseModel):
    message: str
    history: list[dict] = []
    symbol: str | None = None

@app.get("/metrics")
async def metrics(symbol: str = "AAPL"):
    metrics, signals = await get_metrics_and_signals(symbol)
    return {"metrics": metrics, "signals": signals}

@app.post("/agent")
async def agent(req: AgentRequest):
    reply = await run_agent(req.message, req.history, req.symbol or "AAPL")
    return {"reply": reply}

# Register search endpoint
app.include_router(search_router)
