"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { supabaseClient } from "@/lib/supabase/client";

const CHART_COLOR = "#1573ff";
const PIE_COLORS = [
  "#1573ff",
  "#FF7B00",
  "#2E7D32",
  "#7B1FA2",
  "#00838F",
  "#C62828",
  "#6D4C41",
  "#F9A825",
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

function labelizeSection(key) {
  if (!key) return "Unknown";
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StaffSchoolCharts({ days = 90 }) {
  const [accessToken, setAccessToken] = useState("");
  const [chartData, setChartData] = useState([]);
  const [sectionData, setSectionData] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setAccessToken(data?.session?.access_token ?? "");
    };

    loadSession();

    const { data: sub } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setAccessToken(session?.access_token ?? "");
      }
    );

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let mounted = true;

    const loadMetrics = async () => {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/staff/school-metrics?days=${days}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = await res.json().catch(() => ({}));

      if (!mounted) {
        return;
      }

      if (!res.ok) {
        setError(body.error || "Failed to load staff metrics.");
        setChartData([]);
        setSectionData([]);
        setSchoolName("");
        setLoading(false);
        return;
      }

      setChartData(body.data?.dailySeries ?? []);
      setSectionData(body.data?.sectionAverages ?? []);
      setSchoolName(body.data?.school?.name ?? "");
      setLoading(false);
    };

    loadMetrics();

    return () => {
      mounted = false;
    };
  }, [accessToken, days]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, row) => {
        if (typeof row.avg_score === "number") {
          acc.sum += row.avg_score;
          acc.count += 1;
        }
        acc.reviews += row.review_count ?? 0;
        return acc;
      },
      { sum: 0, count: 0, reviews: 0 }
    );
  }, [chartData]);

  const avgScore =
    totals.count > 0 ? (totals.sum / totals.count).toFixed(2) : null;

  const piePayload = useMemo(() => {
    return sectionData.map((row) => ({
      name: labelizeSection(row.section_key),
      value: Number(row.avg_rating?.toFixed(2)),
      count: row.count,
    }));
  }, [sectionData]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-brand-blue dark:border-brand-cream bg-brand-cream p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg text-brand-brown font-semibold">
              {schoolName ? `${schoolName} review trends` : "Review trends"}
            </h2>
            <p className="text-sm text-brand-brown">
              Daily average scores for the last {days} days.
            </p>
          </div>
          <div className="rounded-full border border-brand-brown bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-brown">
            <span className="block text-xs uppercase tracking-wide opacity-70">
              Avg score
            </span>
            <span className="text-base">
              {avgScore ?? "—"}
            </span>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-brand-orange">{error}</p> : null}

        {loading ? (
          <p className="mt-4 text-sm text-brand-brown">Loading chart data...</p>
        ) : chartData.length === 0 ? (
          <p className="mt-4 text-sm text-brand-brown">
            No review activity yet.
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
                  formatter={(value) => [
                    typeof value === "number" ? value.toFixed(2) : value,
                    "Avg score",
                  ]}
                  labelFormatter={formatLongDate}
                />
                <Line
                  dataKey="avg_score"
                  type="monotone"
                  stroke={CHART_COLOR}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-brand-blue dark:border-brand-cream bg-brand-cream p-6">
        <div className="space-y-1 border-b border-slate-200 pb-4">
          <h3 className="text-lg text-brand-brown font-semibold">
            Section comparison
          </h3>
          <p className="text-sm text-brand-brown">
            Average scores by review section.
          </p>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-brand-brown">Loading section data...</p>
        ) : piePayload.length === 0 ? (
          <p className="mt-4 text-sm text-brand-brown">
            No section ratings yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} (n=${props?.payload?.count ?? 0})`,
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#3D2901",
                      fontSize: 12,
                      color: "#3D2901",
                    }}
                  />
                  <Pie
                    data={piePayload}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {piePayload.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm text-brand-brown">
              {piePayload.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        PIE_COLORS[index % PIE_COLORS.length],
                    }}
                  />
                  <span className="flex-1">{entry.name}</span>
                  <span className="font-semibold">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
