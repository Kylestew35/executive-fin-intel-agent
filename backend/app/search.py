import json
from pathlib import Path
from fastapi import APIRouter, Query

router = APIRouter()

# Load tickers.json once at startup
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "tickers.json"

with open(DATA_PATH, "r", encoding="utf-8") as f:
    STOCKS = json.load(f)

@router.get("/search")
async def search_companies(query: str = Query(...)):
    q = query.lower()
    results = [
        s for s in STOCKS
        if q in s["symbol"].lower() or q in s["name"].lower()
    ]
    return {"results": results}
