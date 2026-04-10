import json
import os
from pathlib import Path

MEMORY_FILE = Path("agent_memory.json")

def load_memory(user_id: str):
    if not MEMORY_FILE.exists():
        return []
    try:
        data = json.loads(MEMORY_FILE.read_text())
        return data.get(user_id, [])
    except Exception:
        return []

def save_memory(user_id: str, history: list):
    if MEMORY_FILE.exists():
        data = json.loads(MEMORY_FILE.read_text())
    else:
        data = {}

    data[user_id] = history
    MEMORY_FILE.write_text(json.dumps(data, indent=2))
