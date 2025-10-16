"use client";

import { useEffect, useMemo, useState } from "react";
import { Title, Text } from "rizzui";
import { LuTrophy } from "react-icons/lu";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
} from "recharts";

/* -------------------- ORIGINAL DATA (unchanged) -------------------- */
const leaderboardData = [
  {
    rank: 1,
    name: "Autoppia Operator",
    score: 72,
    logo: "/images/autoppia-logo.png",
    type: "Autoppia",
    medal: "🥇",
  },
  {
    rank: 2,
    name: "Browser Use GPT-5",
    score: 65,
    logo: "/images/gpt-logo.png",
    type: "GPT Agent",
    medal: "🥈",
  },
  {
    rank: 3,
    name: "Browser Use Claude 4.5 Sonnet",
    score: 56,
    logo: "/images/claude-logo.png",
    type: "Claude Agent",
    medal: "🥉",
  },
  {
    rank: 4,
    name: "Anthropic CUA",
    score: 55,
    logo: "/images/anthropic-logo.png",
    type: "Anthropic",
  },
  {
    rank: 5,
    name: "OpenAI CUA",
    score: 50,
    logo: "/images/openai-logo.png",
    type: "OpenAI",
  },
  {
    rank: 6,
    name: "Agent-Q",
    score: 48,
    logo: "/images/agent-q-logo.png",
    type: "AI Agent",
  },
  {
    rank: 7,
    name: "Gemini Web Agent",
    score: 45,
    logo: "/images/gemini-logo.png",
    type: "Google",
  },
  {
    rank: 8,
    name: "GPT Researcher",
    score: 42,
    logo: "/images/gpt-researcher-logo.png",
    type: "Research Agent",
  },
];

/* -------------------- Helpers -------------------- */
const baseData = leaderboardData.map((d) => ({
  label: `${d.rank <= 3 ? d.medal + " " : ""}${d.name.replace("Browser Use ", "").replace("Claude 4.5 ", "Claude ")}`,
  score: d.score,
  rank: d.rank,
  type: d.type,
}));

const useIsMobile = (bp = 640) => {
  const [isMobile, set] = useState(false);
  useEffect(() => {
    const on = () => set(window.innerWidth < bp);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [bp]);
  return isMobile;
};

const shorten = (s: string, max = 28) =>
  s.length > max ? s.slice(0, max - 1) + "…" : s;

function EndPillLabel(props: any) {
  const { x, y, width, height, value, index } = props;
  if (
    x == null ||
    y == null ||
    width == null ||
    height == null ||
    index == null
  )
    return null;

  const datum = baseData[index];
  const right = x + width;
  const isTop3 = datum.rank <= 3;
  const medal =
    datum.rank === 1
      ? "🥇"
      : datum.rank === 2
        ? "🥈"
        : datum.rank === 3
          ? "🥉"
          : "";

  return (
    <foreignObject x={right - 6} y={y + height / 2 - 12} width={96} height={24}>
      <div className="flex items-center gap-1.5">
        {isTop3 && (
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded bg-white text-[11px] font-bold text-slate-900 shadow">
            {medal}
          </span>
        )}
        <span className="inline-flex items-center justify-center h-6 min-w-12 px-2 rounded-full bg-white text-[11px] font-extrabold text-slate-900 shadow">
          {Number(value).toFixed(1)}%
        </span>
      </div>
    </foreignObject>
  );
}

function ScoreTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-blue-500/30 bg-[#0A1220]/95 px-3 py-2 shadow-2xl backdrop-blur-md">
      <div className="text-[11px] font-medium text-blue-300">
        Rank #{p.rank}
        {p.type ? ` • ${p.type}` : ""}
      </div>
      <div className="text-sm font-semibold text-white">
        {p.fullLabel ?? p.label}
      </div>
      <div className="mt-1 text-base font-extrabold text-white">{p.score}%</div>
    </div>
  );
}

/* -------------------- Component -------------------- */
export default function Leaderboard() {
  const isMobile = useIsMobile();

  // Prepare data per breakpoint: keep full label for tooltip, short label for Y axis on mobile
  const chartData = useMemo(
    () =>
      baseData.map((d) => ({
        ...d,
        fullLabel: d.label,
        label: isMobile ? shorten(d.label, 28) : d.label,
      })),
    [isMobile]
  );

  // Dynamic Y-axis width so labels don't clip (min..max with length heuristic)
  const longest = useMemo(
    () => chartData.reduce((m, d) => Math.max(m, (d.label ?? "").length), 0),
    [chartData]
  );
  const yAxisWidth = Math.min(
    Math.max(longest * 7.2, isMobile ? 180 : 240),
    isMobile ? 230 : 320
  );

  // Row sizing tuned per breakpoint
  const rowHeight = isMobile ? 48 : 56;
  const barSize = isMobile ? 14 : 18;
  const chartHeight = rowHeight * chartData.length;

  const avg = Number(
    (
      leaderboardData.reduce((s, d) => s + d.score, 0) / leaderboardData.length
    ).toFixed(1)
  );

  return (
    <div className="w-full min-h-screen pb-12 relative overflow-hidden">
      {/* soft texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] [background-image:radial-gradient(1px_1px_at_2px_2px,#fff_50%,transparent_51%)] [background-size:18px_18px]" />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HERO */}
        <div className="relative bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 border border-blue-400/25 rounded-3xl p-6 sm:p-10 mb-8 backdrop-blur-xl shadow-2xl">
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur-xl opacity-40 motion-safe:animate-pulse" />
                <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-2xl">
                  <LuTrophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
            </div>
            <Title
              as="h1"
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-200 via-sky-200 to-indigo-200 bg-clip-text text-transparent"
            >
              Infinite Web Arena Leaderboard
            </Title>
            <Text className="mt-2 text-xs sm:text-sm text-slate-200/80">
              Top performing web agents ranked by IWA Score
            </Text>
          </div>
        </div>

        {/* BODY */}
        <div className="relative bg-gradient-to-br from-blue-500/5 via-sky-500/5 to-indigo-500/5 border border-blue-400/20 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="relative p-4 sm:p-6 lg:p-8">
            {/* METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-400/20">
                <Text className="text-2xl sm:text-3xl font-extrabold text-white">
                  {leaderboardData[0].score}%
                </Text>
                <Text className="text-[11px] sm:text-xs text-blue-200 mt-1 font-semibold">
                  Top Score
                </Text>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-400/20">
                <Text className="text-2xl sm:text-3xl font-extrabold text-white">
                  {avg}%
                </Text>
                <Text className="text-[11px] sm:text-xs text-sky-200 mt-1 font-semibold">
                  Average Score
                </Text>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-400/20">
                <Text className="text-2xl sm:text-3xl font-extrabold text-white">
                  {leaderboardData.length}
                </Text>
                <Text className="text-[11px] sm:text-xs text-indigo-200 mt-1 font-semibold">
                  Total Agents
                </Text>
              </div>
            </div>

            {/* CHART */}
            <div className="rounded-3xl border-2 border-cyan-400/30 bg-slate-950/60 backdrop-blur-2xl p-8 shadow-[0_35px_100px_-35px_rgba(0,0,0,0.7)]">
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
                IWA Performance Score
              </h3>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 8, right: 40, left: 0, bottom: 8 }}
                  barSize={barSize}
                  barCategoryGap={isMobile ? "24%" : "18%"}
                >
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#22D3EE" />
                      <stop offset="40%" stopColor="#3B82F6" />
                      <stop offset="70%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    horizontal={false}
                    stroke="#1E293B"
                    strokeWidth={1.5}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "#E2E8F0", fontWeight: 700 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={yAxisWidth}
                    tick={{ fill: "#FFF", fontWeight: 900 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(34,211,238,0.15)" }}
                    content={<ScoreTooltip />}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <ReferenceLine
                    x={avg}
                    stroke="#22D3EE"
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    label={{
                      value: `Avg: ${avg}%`,
                      fill: "#22D3EE",
                      fontWeight: 800,
                    }}
                  />
                  <Bar dataKey="score" fill="url(#barGradient)">
                    <LabelList
                      dataKey="score"
                      position="right"
                      content={<EndPillLabel />}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* /CHART */}
          </div>
        </div>
      </div>
    </div>
  );
}
