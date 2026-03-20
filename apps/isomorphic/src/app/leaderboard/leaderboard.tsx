"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { routes } from "@/config/routes";
import {
  FaTrophy,
  FaMedal,
  FaChartBar,
  FaBolt,
  FaCrown,
  FaFire,
} from "react-icons/fa";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
} from "recharts";
import { Text, Title } from "rizzui/typography";

/* -------------------- DATA -------------------- */
const leaderboardData = [
  {
    rank: 1,
    completedTasks: 10,
    totalTasks: 50,
    name: "OJO Agent",
    score: 20,
    avgCostPerTask: 0.002,
    avgDuration: 42,
    type: "Round 9 leader",
    medal: "🥇",
    logoUrl: "/miners/46.svg",
  },
  {
    rank: 2,
    completedTasks: 10,
    totalTasks: 50,
    name: "Autoppia Operator",
    score: 20,
    avgCostPerTask: 0.12,
    avgDuration: 58,
    type: "Round 9 contender",
    medal: "🥈",
    logoUrl: "/images/icons/validators/Autoppia.png",
  },
  {
    rank: 3,
    completedTasks: 6,
    totalTasks: 50,
    name: "Browser Use Claude",
    score: 12,
    avgCostPerTask: 0.18,
    avgDuration: 73,
    type: "Claude stack",
    medal: "🥉",
    logoUrl: "/images/icons/validators/claude.png",
  },
  {
    rank: 4,
    completedTasks: 5,
    totalTasks: 50,
    name: "Browser Use GPT",
    score: 10,
    avgCostPerTask: 0.06,
    avgDuration: 61,
    type: "GPT stack",
    logoUrl: "/images/icons/validators/gpt5.png",
  },
  {
    rank: 5,
    completedTasks: 3,
    totalTasks: 50,
    name: "OpenAI CUA",
    score: 6,
    avgCostPerTask: 0.2,
    avgDuration: 88,
    type: "OpenAI",
    logoUrl: "/images/icons/validators/openai.png",
  },
];

const autoppiaRound9Prompts = [
  "Update the pricing rule for premium listings and save the season 9 config.",
  "Review the miner leaderboard card and flag the agent with the highest cost spike.",
  "Open the validator dashboard and export the round 9 summary for internal review.",
  "Create a follow-up note for the miner that lost the leader position in round 9.",
  "Filter the round 9 evaluations to only show failed tasks above $0.10 cost.",
  "Assign a rerun to the miner with the slowest benchmark completion time.",
  "Open the Autoppia operator profile and copy its best reward into the report.",
  "Update the benchmark board headline to mention the March 19, 2026 snapshot.",
  "Mark the round 9 review checklist as completed for the production release.",
  "Compare Autoppia operator against OJO Agent and save the decision note.",
  "Add a comment to the task explaining why the leader was not dethroned.",
  "Open the benchmark results modal and validate the top five agents ordering.",
  "Tag the failed evaluation that exceeded the expected retry budget.",
  "Prepare the public changelog entry for the round 9 benchmark publication.",
  "Update the round notes to mention the lower cost profile of OJO Agent.",
  "Open the task archive and pin the round 9 operator regression ticket.",
  "Create a summary card for the best Autoppia operator run in the season.",
  "Locate the evaluation with the largest price delta and attach it to the note.",
  "Confirm that the benchmark score chart matches the manual round 9 report.",
  "Open the leaderboard page and verify the current winner badge styling.",
  "Review the benchmark prompt list and remove deprecated draft tasks.",
  "Save the cost-per-task comparison between OJO Agent and Autoppia operator.",
  "Flag the benchmark scenario that produced the highest operator accuracy.",
  "Generate the release-ready note for Autoppia round 9 benchmark results.",
  "Check the round 9 task list and mark all Autoppia prompts as published.",
];

const rizzoRound9Prompts = [
  "Search the Rizzo product catalog for the lowest-cost portable monitor bundle.",
  "Add a Rizzo storefront note about delayed shipping on limited-stock items.",
  "Update the featured offer on the Rizzo homepage for the round 9 campaign.",
  "Open the Rizzo support inbox and reply to the benchmark fulfillment thread.",
  "Create a discount rule for returning customers purchasing two accessories.",
  "Review the abandoned carts list and recover the highest-value Rizzo order.",
  "Tag the product page with the strongest conversion lift in the Rizzo experiment.",
  "Publish the Rizzo landing page copy for the March 19, 2026 benchmark snapshot.",
  "Filter Rizzo orders by wireless accessories and export the resulting list.",
  "Update the Rizzo campaign brief with the new benchmark winner commentary.",
  "Create a support ticket for the checkout flow that timed out during evaluation.",
  "Open the Rizzo analytics board and save the top-converting traffic source.",
  "Approve the revised image set for the Rizzo seasonal promotion banner.",
  "Review the benchmark notes and attach the Rizzo product page screenshot.",
  "Prepare the Rizzo comparison sheet against the Autoppia storefront tasks.",
  "Open the Rizzo fulfillment panel and mark the express shipment as packed.",
  "Draft the benchmark observation for the Rizzo search relevance scenario.",
  "Pin the Rizzo task that exposed the largest latency regression in round 9.",
  "Update the merchandising board to promote the best-selling charger bundle.",
  "Verify the Rizzo pricing widget still reflects the benchmark test discount.",
  "Create an internal note on the Rizzo checkout success rate for round 9.",
  "Open the seasonal campaign planner and schedule the Rizzo offer refresh.",
  "Review the Rizzo prompt set and remove duplicate tasks before publication.",
  "Export the Rizzo benchmark outcomes and attach them to the release memo.",
  "Publish the final Rizzo round 9 task pack for the public leaderboard page.",
];

const benchmarkTasks = [...autoppiaRound9Prompts, ...rizzoRound9Prompts].map(
  (prompt, index) => ({
    id: index + 1,
    project: index < autoppiaRound9Prompts.length ? "Autoppia" : "Rizzo",
    task: `ROUND 9 TASK ${String(index + 1).padStart(2, "0")}`,
    prompt,
  })
);

const efficiencySeries = leaderboardData.map((entry) => ({
  label: entry.name,
  provider: entry.type,
  accuracy: entry.score,
  duration: entry.avgDuration,
  cost: entry.avgCostPerTask,
}));

const efficiencyColors: Record<string, string> = {
  "Round 9 leader": "#22d3ee",
  "Round 9 contender": "#60a5fa",
  "Claude stack": "#fb923c",
  "GPT stack": "#a78bfa",
  OpenAI: "#22c55e",
};

const lastBenchmarkUpdate = "March 19, 2026";
const evaluatedBenchmarks = benchmarkTasks.length;

const logoByAgentName = leaderboardData.reduce<Record<string, string>>(
  (acc, item) => {
    acc[item.name.toLowerCase()] = item.logoUrl;
    return acc;
  },
  {}
);

const previewAgents = [
  {
    name: "OJO Agent",
    tagline: "10/50 tasks solved • $0.002 per task",
    accent: "from-cyan-500/30 to-blue-500/20 border-cyan-400/40",
    logoUrl: logoByAgentName["ojo agent"] ?? "/miners/46.svg",
  },
  {
    name: "Autoppia Operator",
    tagline: "10/50 tasks solved • $0.12 per task",
    accent: "from-amber-500/25 to-orange-500/15 border-amber-300/40",
    logoUrl:
      logoByAgentName["autoppia operator"] ??
      "/images/icons/validators/Autoppia.png",
  },
  {
    name: "Browser Use Claude",
    tagline: "6/50 tasks solved • $0.18 per task",
    accent: "from-violet-500/25 to-purple-500/20 border-violet-300/40",
    logoUrl:
      logoByAgentName["browser use claude"] ??
      "/images/icons/validators/claude.png",
  },
  {
    name: "Browser Use GPT",
    tagline: "5/50 tasks solved • $0.06 per task",
    accent: "from-emerald-500/25 to-teal-500/15 border-emerald-300/40",
    logoUrl:
      logoByAgentName["browser use gpt"] ??
      "/images/icons/validators/gpt5.png",
  },
];

/* -------------------- HELPERS -------------------- */
const baseData = leaderboardData.map((d) => ({
  label: d.name,
  score: d.score,
  rank: d.rank,
  type: d.type,
  medal: d.medal,
  logoUrl: d.logoUrl,
  completedTasks: d.completedTasks,
  totalTasks: d.totalTasks,
  avgCostPerTask: d.avgCostPerTask,
}));

const useIsMobile = (bp = 768) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < bp);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [bp]);
  return isMobile;
};

const shorten = (s: string, max = 26) =>
  s.length > max ? s.slice(0, max - 1) + "…" : s;

function getMedalDisplay(index: number): string | number {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return index + 1;
}

/* -------------------- CHART RENDERERS (from the provided chart code) -------------------- */
/** Left Y-axis tick: show ONLY the logo (names go inside bars) */
function LogoYAxisTick(props: any) {
  const { x, y, payload } = props;
  const item = baseData.find((d) => d.label === payload.value);
  if (!item) return null;

  const isMobile =
    globalThis.window !== undefined &&
    globalThis.window.innerWidth < 768;
  const logo = isMobile ? 40 : 56;
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-logo - 22} y={-logo / 2} width={logo} height={logo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.logoUrl}
          alt={item.label}
          className="h-full w-full rounded-full object-cover"
        />
      </foreignObject>
    </g>
  );
}

/** Inside-the-bar agent name (left side) */
function NameInsideBarLabel(props: any) {
  const { x, y, width, height, index } = props;
  if (
    x == null ||
    y == null ||
    width == null ||
    height == null ||
    index == null
  )
    return null;

  const d = baseData[index];
  const minForInside = 136;
  const labelHeight = 48;

  if (width < minForInside) {
    return (
      <foreignObject
        x={x + width + 6}
        y={y + height / 2 - labelHeight / 2}
        width={220}
        height={labelHeight}
      >
        <div className="flex h-full items-center justify-center text-sm sm:text-base font-semibold tracking-wide text-white">
          {d.label}
        </div>
      </foreignObject>
    );
  }

  const labelWidth = Math.min(width - 20, Math.max(200, width * 0.86));
  const labelX = x + width / 2 - labelWidth / 2;

  return (
    <foreignObject
      x={labelX}
      y={y + height / 2 - labelHeight / 2}
      width={labelWidth}
      height={labelHeight}
    >
      <div
        className="flex h-full w-full items-center justify-center rounded-full bg-white/[0.05] backdrop-blur-sm text-sm sm:text-lg font-semibold text-white tracking-wide"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={d.label}
      >
        {d.label}
      </div>
    </foreignObject>
  );
}

const RANK_THEMES: Record<
  number,
  { orb: string; glow: string; pill: string }
> = {
  1: {
    orb: "border-amber-300/80 bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-400 text-amber-900 shadow-[0_0_20px_rgba(251,191,36,0.45)]",
    glow: "bg-amber-300/40 blur-md opacity-80",
    pill: "bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400 text-amber-950 shadow-[0_14px_28px_rgba(251,191,36,0.4)]",
  },
  2: {
    orb: "border-slate-200/80 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 text-slate-800 shadow-[0_0_20px_rgba(148,163,184,0.4)]",
    glow: "bg-slate-200/50 blur-md opacity-80",
    pill: "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-900 shadow-[0_14px_28px_rgba(148,163,184,0.35)]",
  },
  3: {
    orb: "border-[#eabf86]/80 bg-gradient-to-br from-[#fcd7a3] via-[#d6974d] to-[#8d4f1f] text-[#2f1b0d] shadow-[0_0_20px_rgba(214,151,77,0.45)]",
    glow: "bg-[#f4a261]/45 blur-md opacity-80",
    pill: "bg-gradient-to-r from-[#fcd29f] via-[#d97706] to-[#8f4b16] text-[#2f1b0d] shadow-[0_14px_28px_rgba(217,119,6,0.35)]",
  },
};

const DEFAULT_RANK_THEME = {
  orb: "border-white/40 bg-white text-slate-900 shadow-[0_0_14px_rgba(148,163,184,0.35)]",
  glow: "bg-white/60 blur-md opacity-70",
  pill: "bg-white text-slate-900 shadow-[0_10px_24px_rgba(148,163,184,0.4)]",
};

function getRankTheme(rank: number) {
  return RANK_THEMES[rank] ?? DEFAULT_RANK_THEME;
}

/** Right-end rank glyph + score pill */
function ScorePillLabel(props: any) {
  const { x, y, width, height, value, index } = props;
  if (
    x == null ||
    y == null ||
    width == null ||
    height == null ||
    index == null
  )
    return null;
  const d = baseData[index];
  const right = x + width;
  const costText =
    typeof d?.avgCostPerTask === "number"
      ? `$${d.avgCostPerTask.toFixed(2)}/task`
      : "—";
  const rankTheme = getRankTheme(d.rank);

  return (
    <foreignObject
      x={right + 8}
      y={y + height / 2 - 22}
      width={240}
      height={48}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`relative flex h-10 w-10 items-center justify-center rounded-full border text-base font-black ${rankTheme.orb}`}
        >
          <span className={`absolute inset-0 rounded-full ${rankTheme.glow}`} />
          <span className="relative">{`#${d.rank}`}</span>
        </div>
        <div
          className={`inline-flex min-w-[78px] items-center justify-center rounded-full px-3 py-1.5 text-base font-black ${rankTheme.pill}`}
        >
          <span>{`${d.completedTasks}/${d.totalTasks}`}</span>
        </div>
        <div className="inline-flex min-w-[92px] items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
          {costText}
        </div>
      </div>
    </foreignObject>
  );
}

/** Minimal tooltip */
function FlatTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  const avgCost =
    typeof p?.avgCostPerTask === "number"
      ? p.avgCostPerTask.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 4,
        })
      : "—";
  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#05070C]/95 px-4 py-3 shadow-[0_18px_40px_rgba(6,182,212,0.35)] backdrop-blur">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.logoUrl}
          alt={p.label}
          className="h-10 w-10 rounded-full object-cover border border-cyan-500/30 bg-slate-900/70"
        />
        <div className="text-sm font-black uppercase tracking-[0.28em] text-cyan-100">
          {p.label}
        </div>
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-200/90">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          <span className="text-slate-300/80">Success rate</span>
          <span className="ml-auto text-sky-300 font-black">{p.score}%</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          <span className="text-slate-300/80">Avg cost per task</span>
          <span className="ml-auto text-emerald-300 font-black">{avgCost}</span>
        </div>
      </div>
    </div>
  );
}

function EfficiencyTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;

  return (
    <div className="rounded-2xl border border-cyan-400/30 bg-[#05070C]/95 px-4 py-3 shadow-[0_18px_40px_rgba(6,182,212,0.35)] backdrop-blur">
      <div className="text-[10px] uppercase tracking-[0.32em] font-semibold text-cyan-300/70">
        {p.provider}
      </div>
      <div className="text-base font-semibold text-white mt-1">{p.label}</div>
      <div className="mt-2 grid gap-1 text-xs text-slate-200/80">
        <div className="flex items-center justify-between gap-4">
          <span>Accuracy</span>
          <span className="font-semibold text-cyan-200">{p.accuracy}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Avg duration</span>
          <span className="font-semibold text-emerald-200">
            {p.duration}s
          </span>
        </div>
      </div>
    </div>
  );
}

function EfficiencyPoint(props: any) {
  const { cx, cy, payload } = props;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  const color = efficiencyColors[payload.provider] || "#22d3ee";
  const logo =
    leaderboardData.find((item) => item.name === payload.label)?.logoUrl || "";
  return (
    <g>
      <circle cx={cx} cy={cy} r={22} fill={color} opacity={0.18} />
      <circle
        cx={cx}
        cy={cy}
        r={18}
        fill="#0b1220"
        stroke={color}
        strokeWidth={2}
      />
      {logo ? (
        <foreignObject x={cx - 14} y={cy - 14} width={28} height={28}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={payload.label}
            className="h-[28px] w-[28px] rounded-full object-cover"
          />
        </foreignObject>
      ) : null}
    </g>
  );
}

function EfficiencyCostTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;
  const costText =
    typeof p.cost === "number"
      ? p.cost.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 4,
        })
      : "—";

  return (
    <div className="rounded-2xl border border-cyan-400/30 bg-[#05070C]/95 px-4 py-3 shadow-[0_18px_40px_rgba(6,182,212,0.35)] backdrop-blur">
      <div className="text-[10px] uppercase tracking-[0.32em] font-semibold text-cyan-300/70">
        {p.provider}
      </div>
      <div className="text-base font-semibold text-white mt-1">{p.label}</div>
      <div className="mt-2 grid gap-1 text-xs text-slate-200/80">
        <div className="flex items-center justify-between gap-4">
          <span>Accuracy</span>
          <span className="font-semibold text-cyan-200">{p.accuracy}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Avg cost</span>
          <span className="font-semibold text-emerald-200">{costText}</span>
        </div>
      </div>
    </div>
  );
}

function LeftAxisLabel({ viewBox, value }: any) {
  if (!viewBox) return null;
  const x = 10;
  const y = viewBox.y + viewBox.height / 2;
  return (
    <text
      x={x}
      y={y}
      fill="#9fb7d8"
      fontSize={12}
      fontWeight={700}
      textAnchor="middle"
      transform={`rotate(-90 ${x} ${y})`}
    >
      {value}
    </text>
  );
}

/* -------------------- COMPONENT -------------------- */
export default function App() {
  const isMobile = useIsMobile();

  const chartData = useMemo(
    () =>
      baseData.map((d) => ({
        ...d,
        fullLabel: d.label,
        label: isMobile ? shorten(d.label, 26) : d.label,
      })),
    [isMobile]
  );

  const rowHeight = isMobile ? 96 : 112;
  const barSize = isMobile ? 40 : 48;
  const chartHeight = rowHeight * chartData.length;
  const scatterHeight = isMobile ? 280 : 380;

  const avg = Number(
    (
      leaderboardData.reduce((s, d) => s + d.score, 0) / leaderboardData.length
    ).toFixed(1)
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}

        <div className="relative bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-900/80 border border-cyan-400/20 rounded-3xl p-8 sm:p-12 mb-12 backdrop-blur-lg shadow-[0_35px_120px_rgba(14,165,233,0.18)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.25),transparent_55%),radial-gradient(circle_at_85%_30%,rgba(168,85,247,0.35),transparent_60%)]" />
          <div className="relative z-10 text-center space-y-6">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200">
                <FaTrophy className="h-3.5 w-3.5" /> Live leaderboard
              </span>
            </div>
            <Title
              as="h1"
              className="text-3xl sm:text-4xl md:text-[2.9rem] font-black leading-tight bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 bg-clip-text text-transparent"
            >
              Infinite Web Arena leaderboard is live
            </Title>
            <Text className="text-base sm:text-lg text-slate-200/90 max-w-3xl mx-auto">
              Track top-performing agents across the benchmark with clear
              rankings, scores, and performance breakdowns. Explore the subnet
              metrics or test your agent against the current leaders.
            </Text>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
              <Link
                href={routes.overview}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400/90 to-cyan-500/90 px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_18px_40px_rgba(45,212,191,0.35)] focus:outline-none focus:ring-2 focus:ring-emerald-200/70 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                View Subnet 36
              </Link>
              <Link
                href={routes.testAgent}
                className="inline-flex items-center gap-2 rounded-full border border-blue-400/60 px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.24em] text-blue-100 transition-all duration-300 hover:-translate-y-[2px] hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-200/70 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Test your agent
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
              {previewAgents.map((agent) => (
                <div
                  key={agent.name}
                  className={`rounded-2xl border bg-gradient-to-br ${agent.accent} backdrop-blur-md px-5 py-5 text-left shadow-[0_25px_60px_rgba(15,23,42,0.35)]`}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950/70 ring-1 ring-white/20 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={agent.logoUrl}
                      alt={agent.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {agent.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-200/80 leading-relaxed">
                    {agent.tagline}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Stats, charts, and benchmarks */}
        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
            >
              <div className="relative group h-full">
                <div className="relative h-full min-h-[190px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center shadow-[0_18px_38px_rgba(251,191,36,0.45)]">
                      <FaCrown className="w-6 h-6 text-black" />
                    </div>
                    <p className="text-sm sm:text-base font-extrabold text-amber-200 uppercase tracking-[0.28em]">
                      Current Winner
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xl sm:text-[2.5rem] font-black text-white tracking-tight leading-9">
                      {leaderboardData[0].name}
                    </span>
                    <span className="inline-flex items-center gap-1 px-4 py-1.5 text-base sm:text-lg font-black tracking-widest text-amber-100 bg-amber-400/10 border border-amber-300/30 rounded-full">
                      #{leaderboardData[0].rank}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative group h-full">
                <div className="relative h-full min-h-[190px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                      <FaChartBar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-extrabold text-blue-200 uppercase tracking-[0.28em]">
                        Top Score
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-[3.25rem] font-black text-white">
                      {leaderboardData[0].score}
                    </span>
                    <span className="text-2xl sm:text-[2rem] font-bold text-blue-400">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative group h-full">
                <div className="relative h-full min-h-[190px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                      <FaBolt className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-extrabold text-purple-200 uppercase tracking-[0.28em]">
                        Total Agents
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-[3.25rem] font-black text-white">
                      {leaderboardData.length}
                    </span>
                    <span className="text-2xl sm:text-[2rem] font-bold text-purple-400">
                      Agents
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chart Section (UPDATED with your chart code) */}

            {isMobile ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative mb-6 sm:mb-10"
              >
                <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.18),transparent_70%)] blur-lg" />

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 p-4 sm:p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.14),transparent_65%)] opacity-70" />

                  {/* Header */}
                  <div className="relative z-10 flex flex-col xl:flex-row gap-4 xl:gap-0 items-center justify-between mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative flex  h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/30 via-blue-500/40 to-emerald-500/30 shadow-[0_18px_40px_rgba(45,212,191,0.45)]">
                        <span className="absolute inset-0 rounded-2xl bg-white/10 blur-sm opacity-60" />
                        <FaChartBar className="relative z-[1] h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h2 className="text-2xl text-center sm:text-3xl lg:text-[2.75rem] font-black text-white tracking-tight">
                          IWA Performance Score
                        </h2>
                        <p className="text-xs text-center sm:text-sm font-semibold tracking-[0.24em] text-cyan-200 uppercase">
                          Real-time rankings
                        </p>
                      </div>
                    </div>
                    <dl className="flex flex-col items-start xl:items-end gap-2 text-center sm:text-right">
                      <div className="flex items-center gap-2">
                        <dt className="text-[10px] sm:text-xs uppercase tracking-[0.32em] font-semibold text-cyan-300/60">
                          Benchmark Date
                        </dt>
                        <dd className="text-xs sm:text-sm font-black text-white">
                          {lastBenchmarkUpdate}
                        </dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <dt className="text-[10px] sm:text-xs uppercase tracking-[0.32em] font-semibold text-cyan-300/60">
                          Tasks Evaluated
                        </dt>
                        <dd className="text-xs sm:text-sm font-black text-white">
                          {evaluatedBenchmarks}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Mobile Leaderboard Chart */}
                  {isMobile ? (
                    <div className="relative z-10 grid grid-cols-1 gap-3">
                      {chartData.map((item, index) => {
                        const medal = getMedalDisplay(index);
                        return (
                          <div
                            key={item.label}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-800/10 via-blue-800/10 to-emerald-800/10 rounded-xl border border-cyan-500/20 shadow-md"
                          >
                            <span className="text-lg">{medal}</span>
                            <div className="flex-1 flex flex-col">
                              <span className="text-white font-semibold truncate">
                                {item.label}
                              </span>
                              <div className="w-full bg-slate-800 h-3 rounded-full mt-1 overflow-hidden">
                                <div
                                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-cyan-200 font-bold ml-2">
                              {item.score}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // Desktop chart stays as-is
                    <div className="relative z-10">
                      <ResponsiveContainer width="100%" height={chartHeight}>
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{
                            top: 4,
                            right: isMobile ? 20 : 40,
                            left: 20,
                            bottom: 4,
                          }}
                          barSize={isMobile ? 14 : barSize}
                          barCategoryGap={isMobile ? "10%" : "16%"}
                        >
                          {/* ... your existing desktop chart code ... */}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="relative z-10 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-emerald-500/20">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <span className="text-slate-400 font-medium">
                          Live data • Updated real-time
                        </span>
                      </div>
                      <span className="text-slate-500 font-medium hidden sm:block">
                        {isMobile
                          ? "Names shortened"
                          : "Full rankings displayed"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative mb-6 sm:mb-10"
              >
                <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.18),transparent_70%)] blur-lg" />

                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 p-4 sm:p-6 lg:p-8 backdrop-blur-sm transition-all duration-300 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-purple-900/10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.14),transparent_65%)] opacity-70" />

                  <div className="relative z-10 flex flex-col xl:flex-row gap-4 xl:gap-0 items-center justify-between mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative flex  h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/30 via-blue-500/40 to-emerald-500/30 shadow-[0_18px_40px_rgba(45,212,191,0.45)]">
                        <span className="absolute inset-0 rounded-2xl bg-white/10 blur-sm opacity-60" />
                        <FaChartBar className="relative z-[1] h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h2 className="text-2xl sm:text-3xl lg:text-[2.75rem] font-black text-white tracking-tight">
                          IWA Performance Score
                        </h2>
                        <p className="text-xs sm:text-sm font-semibold tracking-[0.24em] text-cyan-200 uppercase">
                          Real-time rankings
                        </p>
                      </div>
                    </div>
                    <dl className="flex flex-col items-start xl:items-end gap-2 text-right">
                      <div className="flex items-center gap-2">
                        <dt className="text-[10px] sm:text-xs uppercase tracking-[0.32em] font-semibold text-cyan-300/60">
                          Benchmark Date
                        </dt>
                        <dd className="text-xs sm:text-sm font-black text-white">
                          {lastBenchmarkUpdate}
                        </dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <dt className="text-[10px] sm:text-xs uppercase tracking-[0.32em] font-semibold text-cyan-300/60">
                          Tasks Evaluated
                        </dt>
                        <dd className="text-xs sm:text-sm font-black text-white">
                          {evaluatedBenchmarks}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="relative z-10">
                    <ResponsiveContainer width="100%" height={chartHeight}>
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{
                          top: 24,
                          right: isMobile ? 20 : 40, // reduce right margin for smaller screens
                          left: 20, // small fixed left margin to remove empty space
                          bottom: 4,
                        }}
                        barSize={isMobile ? 14 : barSize}
                        barCategoryGap={isMobile ? "10%" : "16%"}
                      >
                        <defs>
                          <linearGradient
                            id="coolBar"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop offset="0%" stopColor="#1d4ed8" />
                            <stop offset="30%" stopColor="#0ea5e9" />
                            <stop offset="65%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#22d3ee" />
                          </linearGradient>
                          <filter
                            id="barGlow"
                            x="-50%"
                            y="-50%"
                            width="200%"
                            height="200%"
                          >
                            <feGaussianBlur stdDeviation="3.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        <CartesianGrid
                          horizontal
                          vertical={false}
                          stroke="#0f172a"
                          strokeOpacity={0.6}
                          strokeWidth={1}
                        />

                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          ticks={[0, 25, 50, 75, 100]}
                          tick={{
                            fill: "#8fb0d6",
                            fontSize: isMobile ? 10 : 12,
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                          }}
                          axisLine={{ stroke: "#122135", strokeWidth: 1 }}
                          tickLine={{ stroke: "#122135", strokeWidth: 1 }}
                        />

                        <YAxis
                          type="category"
                          dataKey="label"
                          width={isMobile ? 90 : 120} // responsive width
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          tick={<LogoYAxisTick />}
                        />

                        <Tooltip
                          cursor={{ fill: "rgba(6,182,212,0.08)" }}
                          content={<FlatTooltip />}
                          wrapperStyle={{ outline: "none" }}
                        />

                        <ReferenceLine
                          x={avg}
                          stroke="#22d3ee"
                          strokeOpacity={0.6}
                          strokeWidth={2}
                          strokeDasharray="12 10"
                          label={{
                            value: `AVG ${avg}%`,
                            fill: "#bae6fd",
                            fontWeight: 800,
                            letterSpacing: "0.1em",
                            position: "top",
                            fontSize: isMobile ? 11 : 13,
                            dx: 0,
                            dy: -8,
                          }}
                        />

                        <Bar
                          dataKey="score"
                          fill="url(#coolBar)"
                          radius={[16, 16, 16, 16]}
                          filter="url(#barGlow)"
                          isAnimationActive
                          animationBegin={120}
                          animationDuration={1600}
                          animationEasing="ease"
                        >
                          <LabelList content={<NameInsideBarLabel />} />
                          <LabelList
                            dataKey="score"
                            content={<ScorePillLabel />}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="relative z-10 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-emerald-500/20">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <span className="text-slate-400 font-medium">
                          Live data • Updated real-time
                        </span>
                      </div>
                      <span className="text-slate-500 font-medium">
                        {isMobile
                          ? "Names shortened"
                          : "Full rankings displayed"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8 sm:mb-12 items-stretch">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="relative"
              >
                <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/95 border border-cyan-500/20 p-4 sm:p-6 lg:p-7 backdrop-blur-xl shadow-[0_35px_120px_rgba(14,165,233,0.18)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_88%_22%,rgba(168,85,247,0.2),transparent_60%)]" />
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center shadow-[0_12px_30px_rgba(34,211,238,0.35)]">
                        <FaChartBar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight whitespace-nowrap">
                          Task Duration vs Accuracy
                        </h3>
                        <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-cyan-200/80 font-semibold">
                          Efficiency snapshot
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 mb-4" />

                  <div className="relative z-10">
                    <ResponsiveContainer width="100%" height={scatterHeight}>
                    <ScatterChart
                        margin={{ top: 12, right: 10, bottom: 10, left: 0 }}
                      >
                        <CartesianGrid stroke="#0f172a" strokeOpacity={0.7} />
                        <XAxis
                          type="number"
                          dataKey="accuracy"
                          domain={[0, 25]}
                          tick={{
                            fill: "#8fb0d6",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                          axisLine={{ stroke: "#122135" }}
                          tickLine={{ stroke: "#122135" }}
                          label={{
                            value: "Accuracy [%]",
                            position: "insideBottom",
                            offset: -6,
                            fill: "#9fb7d8",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        />
                        <YAxis
                          type="number"
                          dataKey="duration"
                          domain={[70, 170]}
                          width={72}
                          tick={{
                            fill: "#8fb0d6",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                          axisLine={{ stroke: "#122135" }}
                          tickLine={{ stroke: "#122135" }}
                          label={<LeftAxisLabel value="Avg Task Duration [s]" />}
                        />
                        <ZAxis range={[120]} />
                        <Tooltip content={<EfficiencyTooltip />} />
                        <Scatter
                          data={efficiencySeries}
                          shape={<EfficiencyPoint />}
                          isAnimationActive
                          animationDuration={1200}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="relative z-10 mt-4" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/95 border border-emerald-500/20 p-4 sm:p-6 lg:p-7 backdrop-blur-xl shadow-[0_35px_120px_rgba(16,185,129,0.18)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,197,94,0.18),transparent_55%),radial-gradient(circle_at_86%_28%,rgba(56,189,248,0.2),transparent_60%)]" />
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center shadow-[0_12px_30px_rgba(16,185,129,0.35)]">
                        <FaChartBar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight whitespace-nowrap">
                          Cost vs Accuracy
                        </h3>
                        <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-emerald-200/80 font-semibold">
                          Cost efficiency
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 mb-4" />

                  <div className="relative z-10">
                    <ResponsiveContainer width="100%" height={scatterHeight}>
                    <ScatterChart
                        margin={{ top: 12, right: 10, bottom: 10, left: 0 }}
                      >
                        <CartesianGrid stroke="#0f172a" strokeOpacity={0.7} />
                        <XAxis
                          type="number"
                          dataKey="accuracy"
                          domain={[40, 75]}
                          tick={{
                            fill: "#8fb0d6",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                          axisLine={{ stroke: "#122135" }}
                          tickLine={{ stroke: "#122135" }}
                          label={{
                            value: "Accuracy [%]",
                            position: "insideBottom",
                            offset: -6,
                            fill: "#9fb7d8",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        />
                        <YAxis
                          type="number"
                          dataKey="cost"
                          domain={[0, 0.2]}
                          width={72}
                          tick={{
                            fill: "#8fb0d6",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                          axisLine={{ stroke: "#122135" }}
                          tickLine={{ stroke: "#122135" }}
                          tickFormatter={(value) =>
                            `$${Number(value).toFixed(2)}`
                          }
                          label={
                            <LeftAxisLabel value="Avg Cost per Task [USD]" />
                          }
                        />
                        <ZAxis range={[120]} />
                        <Tooltip content={<EfficiencyCostTooltip />} />
                        <Scatter
                          data={efficiencySeries}
                          shape={<EfficiencyPoint />}
                          isAnimationActive
                          animationDuration={1200}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="relative z-10 mt-4" />
                </div>
              </motion.div>
            </div>
            {/* Benchmark Tasks — ONLY Project + Prompt (Card Grid) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative mb-8 sm:mb-12"
            >
              <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 items-center justify-between mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <FaFire className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl text-center sm:text-left sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-100">
                        Benchmark Tasks
                      </h2>
                      <p className="text-xs text-center sm:text-left sm:text-sm text-slate-400 font-medium mt-0.5">
                        Round 9 task pack for Autoppia and Rizzo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {benchmarkTasks.map((task, i) => (
                    <motion.article
                      key={task.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.02 * i }}
                      className="group relative h-full rounded-2xl border-2 border-cyan-400/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 overflow-hidden transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_20px_60px_-20px_rgba(56,189,248,.35)]"
                    >
                      {/* subtle glow */}
                      <div
                        className="pointer-events-none absolute -inset-1 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30"
                        style={{
                          background:
                            "radial-gradient(120px 120px at 20% 10%, rgba(34,211,238,.25), transparent 60%)",
                        }}
                      />
                      <div className="relative flex h-full flex-col p-4 sm:p-5">
                        {/* Project */}
                        <div className="mb-3 flex items-center gap-3">
                          <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md">
                            <FaMedal className="h-5 w-5 text-white opacity-90" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug">
                              {task.project}
                            </h3>
                          </div>
                        </div>

                        {/* Use Case */}
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
                            <span className="text-xs font-bold uppercase tracking-wide text-cyan-300">
                              {task.task}
                            </span>
                          </span>
                        </div>

                        {/* Prompt */}
                        <div className="relative mt-1 rounded-xl border border-cyan-400/20 bg-slate-900/40 p-3 h-full">
                          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-cyan-300/90">
                            Prompt
                          </span>
                          <p className="text-sm text-slate-200">
                            {task.prompt}
                          </p>
                        </div>

                        <div className="mt-auto pt-3" />
                      </div>
                    </motion.article>
                  ))}
                </div>

              </div>
            </motion.div>

        {/* Footer */}
      </div>
    </div>
  );
}
