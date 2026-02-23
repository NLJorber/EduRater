"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { supabaseClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHART_COLOR = "#1573ff";
const SECTION_COLORS = [
  "#1573ff",
  "#FBF5E7",
  "#2E7D32",
  "#7B1FA2",
  "#00838F",
  "#C62828",
  "#6D4C41",
  "#F9A825",
];

const AREA_COLORS = {
  reviews: "#1573ff",
  reviews7d: "#f0c2a8",
};

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
  const [timeRange, setTimeRange] = useState("90d");
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

  const sectionPayload = useMemo(() => {
    return sectionData.map((row) => ({
      name: labelizeSection(row.section_key),
      value: Number(row.avg_rating?.toFixed(2)),
      count: row.count,
    }));
  }, [sectionData]);

  const hasLineData = useMemo(
    () => chartData.some((row) => typeof row.avg_score === "number"),
    [chartData]
  );

  const areaChartData = useMemo(() => {
    const referenceDate = chartData.length
      ? new Date(`${chartData[chartData.length - 1].date}T00:00:00Z`)
      : new Date();
    referenceDate.setUTCHours(0, 0, 0, 0);

    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    if (timeRange === "7d") daysToSubtract = 7;

    const startDate = new Date(referenceDate);
    startDate.setUTCDate(startDate.getUTCDate() - (daysToSubtract - 1));

    const filtered = chartData
      .filter((row) => new Date(`${row.date}T00:00:00Z`) >= startDate)
      .map((row) => ({
        date: row.date,
        reviews: row.review_count ?? 0,
      }));

    return filtered.map((row, index, rows) => {
      const windowStart = Math.max(0, index - 6);
      const windowSlice = rows.slice(windowStart, index + 1);
      const rollingAvg =
        windowSlice.reduce((sum, item) => sum + (item.reviews ?? 0), 0) /
        windowSlice.length;

      return {
        ...row,
        reviews7d: Number(rollingAvg.toFixed(2)),
      };
    });
  }, [chartData, timeRange]);

  const hasAreaData = useMemo(
    () =>
      areaChartData.some(
        (row) => typeof row.reviews === "number" && row.reviews > 0
      ),
    [areaChartData]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-brand-blue dark:border-brand-orange bg-brand-cream p-6">
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
        ) : !hasLineData ? (
          <p className="mt-4 text-sm text-brand-brown">
            No review scores yet.
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
                  connectNulls
                  stroke={CHART_COLOR}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-brand-blue dark:border-brand-orange bg-brand-cream p-6">
        <div className="flex items-center gap-2 space-y-0 border-b border-slate-200 pb-4 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <h3 className="text-lg text-brand-brown font-semibold">
              Area chart
            </h3>
            <p className="text-sm text-brand-brown">
              Daily reviews and 7-day rolling average.
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex border-brand-brown text-brand-brown"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-brand-cream border-brand-brown text-brand-brown">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-brand-brown">Loading section data...</p>
        ) : !hasAreaData ? (
          <p className="mt-4 text-sm text-brand-brown">
            No section ratings yet.
          </p>
        ) : (
          <>
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData}>
                  <defs>
                    <linearGradient id="fillReviews" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={AREA_COLORS.reviews}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={AREA_COLORS.reviews}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillReviews7d" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={AREA_COLORS.reviews7d}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={AREA_COLORS.reviews7d}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={formatShortDate}
                  />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#3D2901",
                      fontSize: 12,
                      color: "#3D2901",
                    }}
                    formatter={(value, name) => [
                      typeof value === "number" ? value.toFixed(2) : value,
                      name === "reviews7d" ? "7-day avg" : "Daily reviews",
                    ]}
                    labelFormatter={formatLongDate}
                  />
                  <Area
                    dataKey="reviews"
                    type="natural"
                    fill="url(#fillReviews)"
                    stroke={AREA_COLORS.reviews}
                  />
                  <Area
                    dataKey="reviews7d"
                    type="natural"
                    fill="url(#fillReviews7d)"
                    stroke={AREA_COLORS.reviews7d}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-2 text-sm text-brand-brown">
              {sectionPayload.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-2 rounded-md border px-3 py-2"
                  style={{
                    borderColor: SECTION_COLORS[index % SECTION_COLORS.length],
                    backgroundColor: `${SECTION_COLORS[index % SECTION_COLORS.length]}22`,
                  }}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        SECTION_COLORS[index % SECTION_COLORS.length],
                    }}
                  />
                  <span className="flex-1">{entry.name}</span>
                  <span className="font-semibold">{entry.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
