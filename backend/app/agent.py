import os
from openai import AsyncOpenAI

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def run_agent(message: str, history: list, symbol: str):
    # Expanded, executive‑level system prompt
    system_prompt = (
        f"You are an executive‑level financial intelligence analyst. "
        f"All analysis must focus strictly on the stock ticker {symbol}. "
        f"Provide expanded, high‑value insights with clear reasoning, risk factors, "
        f"drivers, catalysts, and actionable takeaways. "
        f"Write in direct, natural language without markdown, bullets, or headings. "
        f"No disclaimers, no generic advice, no filler. "
        f"Deliver strong, confident, decision‑oriented analysis."
    )

    # Build message stack
    messages = [{"role": "system", "content": system_prompt}]

    for h in history:
        messages.append({"role": h["role"], "content": h["content"]})

    messages.append({"role": "user", "content": message})

    # THIS is where the expanded-output call goes
    completion = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=500,
        temperature=0.4
    )

    return completion.choices[0].message.content
