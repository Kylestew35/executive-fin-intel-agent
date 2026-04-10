import yfinance as yf

async def get_metrics_and_signals(symbol: str = "AAPL"):
    ticker = yf.Ticker(symbol)

    # Fetch latest price
    hist = ticker.history(period="1d")
    if hist.empty:
        price = 0
    else:
        price = float(hist["Close"].iloc[-1])

    # Fetch fundamentals
    info = ticker.info

    pe_ratio = info.get("trailingPE") or 0
    eps = info.get("trailingEps") or 0
    revenue_growth = info.get("revenueGrowth") or 0
    beta = info.get("beta") or 1

    # Fetch REAL historical data (last 30 days)
    history = ticker.history(period="1mo")
    history_prices = [float(x) for x in history["Close"].tolist()]

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
