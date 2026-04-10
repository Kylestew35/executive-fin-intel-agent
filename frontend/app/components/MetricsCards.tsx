export default function MetricsCards({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-2 text-slate-100">
      <p><strong>Price:</strong> ${metrics.price.toFixed(2)}</p>
      <p><strong>P/E Ratio:</strong> {metrics.peRatio}</p>
      <p><strong>EPS:</strong> {metrics.eps}</p>
      <p><strong>Revenue Growth:</strong> {metrics.revenueGrowth}%</p>
      <p><strong>Volatility:</strong> {metrics.volatility}</p>
      <p><strong>Risk Score:</strong> {metrics.riskScore}</p>
    </div>
  );
}
