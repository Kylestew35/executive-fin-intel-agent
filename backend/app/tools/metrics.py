import yfinance as yf

async def get_metrics_and_signals(symbol: str = "AAPL"):
    ticker = yf.Ticker(symbol)

    # --- Try fast_info first ---
    info = ticker.fast_info or {}

    price = info.get("last_price")
    pe_ratio = info.get("pe_ratio")
    eps = info.get("eps")
    beta = info.get("beta")

    # --- If fast_info failed, fall back to get_info() ---
    if not price or price == 0:
        try:
            full = ticker.get_info()
            price = full.get("currentPrice") or price or 0
            pe_ratio = full.get("trailingPE") or pe_ratio or 0
            eps = full.get("trailingEps") or eps or 0
            revenue_growth = full.get("revenueGrowth") or 0
            beta = full.get("beta") or beta or 1
        except:
            revenue_growth = 0
    else:
        revenue_growth = 0  # fast_info doesn't include this

    # --- History (30 days) ---
    try:
        history = ticker.history(period="1mo")
        history_prices = [float(x) for x in history["Close"].tolist()]
    except:
        history_prices = []

    metrics = {
        "symbol": symbol,
        "price": float(price or 0),
        "peRatio": float(pe_ratio or 0),
        "eps": float(eps or 0),
        "revenueGrowth": float(revenue_growth or 0),
        "volatility": "High" if (beta or 1) > 1.2 else "Medium" if (beta or 1) > 0.8 else "Low",
        "riskScore": int((beta or 1) * 50),
        "history": history_prices,
    }

    # --- Signals ---
    signals = []
    if metrics["price"] == 0:
        signals.append({"message": f"{symbol} returned no price data."})
    elif metrics["peRatio"] > 40:
        signals.append({"message": f"{symbol} has a high P/E ratio — potential overvaluation."})
    elif metrics["peRatio"] < 10:
        signals.append({"message": f"{symbol} has a low P/E ratio — potential undervaluation."})
    else:
        signals.append({"message": f"{symbol} trading within normal valuation range."})

    return metrics, signals
