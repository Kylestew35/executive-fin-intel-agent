import yfinance as yf

async def get_metrics_and_signals(symbol: str = "AAPL"):
    ticker = yf.Ticker(symbol)

    # --- Price ---
    try:
        price = float(ticker.fast_info.get("last_price") or 0)
    except:
        price = 0

    # --- Fundamentals ---
    info = ticker.fast_info

    pe_ratio = info.get("pe_ratio") or 0
    eps = info.get("eps") or 0
    revenue_growth = 0  # fast_info doesn't include this
    beta = info.get("beta") or 1

    # --- History (30 days) ---
    try:
        history = ticker.history(period="1mo")
        history_prices = [float(x) for x in history["Close"].tolist()]
    except:
        history_prices = []

    metrics = {
        "symbol": symbol,
        "price": price,
        "peRatio": pe_ratio,
        "eps": eps,
        "revenueGrowth": revenue_growth,
        "volatility": "High" if beta > 1.2 else "Medium" if beta > 0.8 else "Low",
        "riskScore": int((beta or 1) * 50),
        "history": history_prices,
    }

    # --- Signals ---
    signals = []
    if price == 0:
        signals.append({"message": f"{symbol} returned no price data."})
    elif pe_ratio > 40:
        signals.append({"message": f"{symbol} has a high P/E ratio — potential overvaluation."})
    elif pe_ratio < 10:
        signals.append({"message": f"{symbol} has a low P/E ratio — potential undervaluation."})
    else:
        signals.append({"message": f"{symbol} trading within normal valuation range."})

    return metrics, signals
