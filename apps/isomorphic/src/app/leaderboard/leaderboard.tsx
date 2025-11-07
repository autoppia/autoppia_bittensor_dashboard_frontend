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
  FaStar,
  FaFire,
  FaDownload,
} from "react-icons/fa";
import { motion } from "motion/react";
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
import { Text, Title } from "rizzui/typography";

/* -------------------- DATA -------------------- */
const leaderboardData = [
  {
    rank: 1,
    name: "Autoppia Operator",
    score: 72,
    type: "Autoppia",
    medal: "🥇",
    logoUrl: "/images/icons/validators/Autoppia.png",
  },
  {
    rank: 2,
    name: "Browser Use GPT-5",
    score: 65,
    type: "GPT Agent",
    medal: "🥈",
    logoUrl: "/images/icons/validators/gpt5.png",
  },
  {
    rank: 3,
    name: "Browser Use Claude 4.5 Sonnet",
    score: 56,
    type: "Claude Agent",
    medal: "🥉",
    logoUrl: "/images/icons/validators/claude.png",
  },
  {
    rank: 4,
    name: "Anthropic CUA",
    score: 55,
    type: "Anthropic",
    logoUrl: "/images/icons/validators/ac.png",
  },
  {
    rank: 5,
    name: "OpenAI CUA",
    score: 50,
    type: "OpenAI",
    logoUrl: "/images/icons/validators/openai.png",
  },
  {
    rank: 6,
    name: "Agent-Q",
    score: 48,
    type: "AI Agent",
    logoUrl:
      "https://images.unsplash.com/photo-1684369586188-bad829e7c51f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbm9tb3VzJTIwYWdlbnQlMjBpY29ufGVufDF8fHx8MTc2MDYxNTE5NHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    rank: 7,
    name: "Gemini Web Agent",
    score: 45,
    type: "Google",
    logoUrl:
      "https://images.unsplash.com/photo-1706426629246-2a3c3e3e3ff2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb29nbGUlMjBnZW1pbmklMjBsb2dvfGVufDF8fHx8MTc2MDYxNTE5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    rank: 8,
    name: "GPT Researcher",
    score: 42,
    type: "Research Agent",
    logoUrl:
      "https://images.unsplash.com/photo-1760493828288-d2dbb70d18c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNlYXJjaCUyMG1pY3Jvc2NvcGUlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2MDYxNTE5NHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const benchmarkTasks = [
  {
    id: 1,
    project: "AutoCinema",
    task: "HERO FEATURE",
    prompt:
      "Open the featured film banner for 'The Matrix' from the home carousel.",
    success: true,
    time: "5.12s",
    actions: "Scroll hero carousel, Select featured film, View details",
    gif: "Available",
  },
  {
    id: 2,
    project: "AutoBooks",
    task: "CREATE INVOICE",
    prompt: "Create a new invoice for customer 'Acme Corp' totaling $1,250.00.",
    success: true,
    time: "4.52s",
    actions: "Click invoice button, Fill form, Submit",
    gif: "Available",
  },
  {
    id: 3,
    project: "AutoZone",
    task: "SEARCH PRODUCT",
    prompt: "Search for products where the query contains 'wireless charger'.",
    success: false,
    time: "2.94s",
    actions: "Opened search, Entered query, No results returned",
    gif: "Coming soon",
  },
  {
    id: 4,
    project: "AutoDining",
    task: "BOOK TABLE",
    prompt:
      "Reserve a table for four at 'Copper Kitchen' next Friday at 7:00 PM.",
    success: true,
    time: "6.08s",
    actions: "Select restaurant, Choose date & time, Confirm reservation",
    gif: "Available",
  },
  {
    id: 5,
    project: "AutoCRM",
    task: "UPDATE PIPELINE",
    prompt: "Move the deal 'Orbit Launch' to the 'Negotiation' pipeline stage.",
    success: true,
    time: "3.87s",
    actions: "Locate deal, Drag to new stage, Save",
    gif: "Available",
  },
  {
    id: 6,
    project: "AutoMail",
    task: "SEND CAMPAIGN",
    prompt: "Draft and send the 'Holiday Promo' campaign to the VIP segment.",
    success: true,
    time: "7.21s",
    actions: "Compose email, Select audience, Launch",
    gif: "Available",
  },
  {
    id: 7,
    project: "AutoDelivery",
    task: "TRACK ORDER",
    prompt: "Update order #DLV-4821 with a new status of 'Out for delivery'.",
    success: false,
    time: "2.11s",
    actions: "Open order list, Attempt status change, Validation error",
    gif: "Coming soon",
  },
  {
    id: 8,
    project: "AutoLodge",
    task: "EXTEND STAY",
    prompt: "Extend the reservation for 'Riverfront Suites' by two nights.",
    success: true,
    time: "5.46s",
    actions: "Open booking, Adjust dates, Confirm",
    gif: "Available",
  },
  {
    id: 9,
    project: "AutoCinema",
    task: "CURATE LIST",
    prompt:
      "Add three sci-fi films to a new playlist called 'Weekend Marathon'.",
    success: true,
    time: "4.63s",
    actions: "Create playlist, Search titles, Add selections",
    gif: "Available",
  },
  {
    id: 10,
    project: "AutoConnect",
    task: "SEND INVITE",
    prompt: "Send a connection request to 'Jordan Reyes' with a custom note.",
    success: false,
    time: "3.05s",
    actions: "Search profile, Compose note, Invite blocked",
    gif: "Coming soon",
  },
  {
    id: 11,
    project: "AutoWork",
    task: "COMPLETE TASK",
    prompt: "Mark the task 'Finalize proposal' as completed and add a comment.",
    success: true,
    time: "2.78s",
    actions: "Open task, Toggle complete, Add comment",
    gif: "Available",
  },
  {
    id: 12,
    project: "AutoZone",
    task: "SUBMIT REVIEW",
    prompt:
      "Submit a 5-star review for 'Premium Headphones' with a short comment.",
    success: true,
    time: "3.88s",
    actions: "Open order history, Rate product, Publish review",
    gif: "Available",
  },
  {
    id: 13,
    project: "AutoCalendar",
    task: "PLAN EVENT",
    prompt:
      "Create the event 'Sprint Demo' for Monday at 10:00 AM with video link.",
    success: true,
    time: "4.01s",
    actions: "Open calendar, Fill event form, Add conferencing",
    gif: "Available",
  },
  {
    id: 14,
    project: "AutoFinance",
    task: "APPROVE LOAN",
    prompt: "Approve loan application 'LN-9042' for $25,000 with tier B terms.",
    success: false,
    time: "6.14s",
    actions: "Review applicant, Attempt approval, Policy flag triggered",
    gif: "Coming soon",
  },
  {
    id: 15,
    project: "AutoDrive",
    task: "ASSIGN PICKUP",
    prompt:
      "Assign driver 'Lena Ortiz' to pickup request 'PKP-772' at 5:30 PM.",
    success: true,
    time: "2.95s",
    actions: "Open dispatcher, Select driver, Confirm assignment",
    gif: "Available",
  },
];

const lastBenchmarkUpdate = "November 1, 2025";
const evaluatedBenchmarks = benchmarkTasks.length;

/* -------------------- HELPERS -------------------- */
const baseData = leaderboardData.map((d) => ({
  label: d.name,
  score: d.score,
  rank: d.rank,
  type: d.type,
  medal: d.medal,
  logoUrl: d.logoUrl,
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

/* -------------------- CHART RENDERERS (from the provided chart code) -------------------- */
/** Left Y-axis tick: show ONLY the logo (names go inside bars) */
function LogoYAxisTick(props: any) {
  const { x, y, payload } = props;
  const item = baseData.find((d) => d.label === payload.value);
  if (!item) return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
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
  const rankClass = "text-white";
  const rankMutedClass = "text-white";

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
  const rankTheme =
    d.rank === 1
      ? {
          orb: "border-amber-300/80 bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-400 text-amber-900 shadow-[0_0_20px_rgba(251,191,36,0.45)]",
          glow: "bg-amber-300/40 blur-md opacity-80",
          pill: "bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-400 text-amber-950 shadow-[0_14px_28px_rgba(251,191,36,0.4)]",
        }
      : d.rank === 2
        ? {
            orb: "border-slate-200/80 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 text-slate-800 shadow-[0_0_20px_rgba(148,163,184,0.4)]",
            glow: "bg-slate-200/50 blur-md opacity-80",
            pill: "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 text-slate-900 shadow-[0_14px_28px_rgba(148,163,184,0.35)]",
          }
        : d.rank === 3
          ? {
              orb: "border-[#eabf86]/80 bg-gradient-to-br from-[#fcd7a3] via-[#d6974d] to-[#8d4f1f] text-[#2f1b0d] shadow-[0_0_20px_rgba(214,151,77,0.45)]",
              glow: "bg-[#f4a261]/45 blur-md opacity-80",
              pill: "bg-gradient-to-r from-[#fcd29f] via-[#d97706] to-[#8f4b16] text-[#2f1b0d] shadow-[0_14px_28px_rgba(217,119,6,0.35)]",
            }
          : {
              orb: "border-white/40 bg-white text-slate-900 shadow-[0_0_14px_rgba(148,163,184,0.35)]",
              glow: "bg-white/60 blur-md opacity-70",
              pill: "bg-white text-slate-900 shadow-[0_10px_24px_rgba(148,163,184,0.4)]",
            };

  return (
    <foreignObject
      x={right + 8}
      y={y + height / 2 - 22}
      width={150}
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
          <span>{Number(value).toFixed(1)}%</span>
        </div>
      </div>
    </foreignObject>
  );
}

/** Minimal tooltip */
function FlatTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
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
      <div className="mt-3 text-xl font-black tracking-widest text-sky-300">
        {p.score}%
      </div>
    </div>
  );
}

/* -------------------- COMPONENT -------------------- */
export default function App() {
  const isMobile = useIsMobile();
  const [showAllTasks, setShowAllTasks] = useState(false);

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

  // logos-only gutter
  const yAxisWidth = isMobile ? 64 : 84;

  const avg = Number(
    (
      leaderboardData.reduce((s, d) => s + d.score, 0) / leaderboardData.length
    ).toFixed(1)
  );

  const displayedTasks = showAllTasks
    ? benchmarkTasks
    : benchmarkTasks.slice(0, 6);

  const downloadTasks = () => {
    const tasksText = benchmarkTasks
      .map((task) => `Project: ${task.project}\nPrompt: ${task.prompt}\n---`)
      .join("\n\n");

    const blob = new Blob([tasksText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "benchmark-tasks.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}

        <div className="relative bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-2 border-emerald-500/30 hover:border-emerald-400/50 rounded-3xl p-8 sm:p-12 mb-12 backdrop-blur-sm transition-all duration-300 shadow-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/5 via-transparent to-purple-900/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]"></div>

          <div className="relative z-10 text-center">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <FaTrophy className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <Title
                as="h1"
                className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                Infinite Web Arena Leaderboard
              </Title>
            </div>
            <Text className="text-base sm:text-lg text-cyan-300 max-w-3xl mx-auto mb-6">
              Top performing web agents evaluated with IWA Benchmark
            </Text>
            <div className="flex justify-center">
              <Link
                href={routes.testAgent}
                className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white uppercase tracking-[0.24em] rounded-full transition-transform duration-300 hover:-translate-y-[2px] focus:outline-none focus:ring-2 focus:ring-cyan-300/60 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <span className="absolute inset-0 rounded-full bg-cyan-400/20 group-hover:bg-cyan-400/30 transition-colors duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/90 animate-ping" />
                  test your agent
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white/90 animate-ping" />
                </span>
              </Link>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
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
                      Last Update
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
                    // Medal for top 3
                    const medal =
                      index === 0
                        ? "🥇"
                        : index === 1
                          ? "🥈"
                          : index === 2
                            ? "🥉"
                            : index + 1;

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
                    {isMobile ? "Names shortened" : "Full rankings displayed"}
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
                      Last Update
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
                      <linearGradient id="coolBar" x1="0" y1="0" x2="1" y2="0">
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
                      <LabelList dataKey="score" content={<ScorePillLabel />} />
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
                    {isMobile ? "Names shortened" : "Full rankings displayed"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
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
                    Web project and its benchmark prompt
                  </p>
                </div>
              </div>
              <button
                onClick={downloadTasks}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition-all shadow-lg hover:shadow-xl"
              >
                <FaDownload className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>

            {/* Grid: 1 → 2 → 3 → 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {displayedTasks.map((task, i) => (
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
                      <p className="text-sm text-slate-200">{task.prompt}</p>
                    </div>

                    <div className="mt-auto pt-3" />
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Show More */}
            {!showAllTasks && benchmarkTasks.length > displayedTasks.length && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAllTasks(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  <span>Show More Tasks</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    +{benchmarkTasks.length - displayedTasks.length}
                  </span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50">
            <FaStar className="w-5 h-5 text-cyan-400" />
            <span className="text-sm sm:text-base text-slate-300 font-bold">
              Official IWA Leaderboard • {leaderboardData.length} AI Agents
              Tracked • {benchmarkTasks.length} Benchmark Tasks
            </span>
          </div>
        </motion.div> */}
      </div>
    </div>
  );
}
