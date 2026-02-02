"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

const METRICS = [
  { key: "reviews", label: "Reviews", color: "#1573ff" },
  { key: "users", label: "New users", color: "#FF7B00" },
];

function formatShortDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatLongDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminActivityChart({ accessToken, days = 90 }) {
  const [activeMetric, setActiveMetric] = useState("reviews");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let mounted = true;

    const loadChartData = async () => {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/admin/dashboard-metrics?days=${days}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = await res.json().catch(() => ({}));

      if (!mounted) {
        return;
      }

      if (!res.ok) {
        setError(body.error || "Failed to load chart data.");
        setChartData([]);
        setLoading(false);
        return;
      }

      setChartData(body.data ?? []);
      setLoading(false);
    };

    loadChartData();

    return () => {
      mounted = false;
    };
  }, [accessToken, days]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, row) => {
        acc.reviews += row.reviews ?? 0;
        acc.users += row.users ?? 0;
        return acc;
      },
      { reviews: 0, users: 0 }
    );
  }, [chartData]);

  const activeColor =
    METRICS.find((metric) => metric.key === activeMetric)?.color ??
    "var(--chart-1)";

  return (
    <section className="rounded-3xl border border-brand-blue dark:border-brand-cream bg-brand-cream p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h2 className="text-lg text-brand-brown font-semibold">Activity overview</h2>
          <p className="text-sm text-brand-brown">
            Daily totals for the last {days} days.
          </p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-brand-brown bg-brand-cream text-sm">
          {METRICS.map((metric) => (
            <button
              key={metric.key}
              type="button"
              onClick={() => setActiveMetric(metric.key)}
              className={`px-4 py-2 text-sm font-semibold transition ${
                activeMetric === metric.key
                  ? "bg-brand-brown text-brand-cream"
                  : "text-brand-brown hover:bg-brand-orange"
              }`}
            >
              <span className="block text-xs uppercase tracking-wide opacity-70">
                {metric.label}
              </span>
              <span className="text-base">
                {(totals[metric.key] ?? 0).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-brand-orange">{error}</p> : null}

      {loading ? (
        <p className="mt-4 text-sm text-brand-brown">Loading chart data...</p>
      ) : chartData.length === 0 ? (
        <p className="mt-4 text-sm text-brand-brown">
          No activity recorded yet.
        </p>
      ) : (
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={formatShortDate}
              />
              <Tooltip
                cursor={{ stroke: "#3D2901", strokeDasharray: "4 4" }}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "#3D2901",
                  fontSize: 12,
                  color: "#3D2901",
                }}
                labelFormatter={formatLongDate}
              />
              <Line
                dataKey={activeMetric}
                type="monotone"
                stroke={activeColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
