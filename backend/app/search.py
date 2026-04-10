import os
import json
from fastapi import APIRouter, Query

router = APIRouter()

# Simple symbol list (you can expand this later)
STOCKS = [
    {"symbol": "AAPL", "name": "Apple Inc."},
    {"symbol": "MSFT", "name": "Microsoft Corporation"},
    {"symbol": "GOOGL", "name": "Alphabet Inc."},
    {"symbol": "AMZN", "name": "Amazon.com Inc."},
    {"symbol": "TSLA", "name": "Tesla Inc."},
    {"symbol": "META", "name": "Meta Platforms Inc."},
]

@router.get("/search")
async def search_companies(query: str = Query(...)):
    q = query.lower()
    results = [
        s for s in STOCKS
        if q in s["symbol"].lower() or q in s["name"].lower()
    ]
    return {"results": results}
