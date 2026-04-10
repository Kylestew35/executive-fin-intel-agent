import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"

print("Loading:", ENV_PATH)
load_dotenv(dotenv_path=ENV_PATH, override=True)

print("OPENAI:", os.getenv("OPENAI_API_KEY"))
print("ALPHA:", os.getenv("ALPHA_VANTAGE_API_KEY"))
