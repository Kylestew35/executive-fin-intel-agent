"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function PriceChart({ data }: { data: number[] }) {
  const labels = data.map((_, i) => `${i + 1}`);

  return (
    <div className="w-full h-48">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Price",
              data,
              borderColor: "#4ade80",
              backgroundColor: "rgba(74, 222, 128, 0.2)",
              tension: 0.3,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: "#94a3b8" } },
            y: { ticks: { color: "#94a3b8" } },
          },
        }}
      />
    </div>
  );
}
