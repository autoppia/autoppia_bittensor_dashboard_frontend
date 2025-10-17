"use client";
import { useEffect, useMemo, useState } from "react";
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
    project: "Autoppia AutoZone",
    task: "SEARCH_PRODUCT",
    prompt: "Search for products where the query contains 'rtabl'",
    success: false,
    time: "0.00s",
    actions: "No actions recorded",
    gif: "Coming soon",
  },
  {
    id: 2,
    project: "Autoppia AutoZone",
    task: "CAROUSEL_SCROLL",
    prompt:
      "Scroll right in the 'Top Sellers In Home' carousel where the direction is NOT 'LEFT'",
    success: false,
    time: "0.00s",
    actions: "No actions recorded",
    gif: "Coming soon",
  },
  {
    id: 3,
    project: "Autobooks Dashboard",
    task: "CREATE_INVOICE",
    prompt:
      "Create a new invoice for customer 'Acme Corp' with amount $1,250.00",
    success: true,
    time: "4.52s",
    actions: "Click invoice button, Fill form, Submit",
    gif: "Available",
  },
  {
    id: 4,
    project: "Autocinema Booking",
    task: "BOOK_TICKETS",
    prompt: "Book 2 tickets for 'The Matrix' showing at 7:30 PM on Friday",
    success: true,
    time: "6.23s",
    actions: "Select movie, Choose seats, Confirm booking",
    gif: "Available",
  },
  {
    id: 5,
    project: "Autobooks Expenses",
    task: "ADD_EXPENSE",
    prompt: "Add a business expense for office supplies totaling $89.99",
    success: true,
    time: "3.12s",
    actions: "Navigate to expenses, Fill details, Save",
    gif: "Available",
  },
  {
    id: 6,
    project: "Autocinema Search",
    task: "FILTER_MOVIES",
    prompt: "Filter movies by genre 'Action' and rating above 4 stars",
    success: false,
    time: "1.45s",
    actions: "Applied filters incorrectly",
    gif: "Coming soon",
  },
  {
    id: 7,
    project: "Autoppia Shopping",
    task: "ADD_TO_CART",
    prompt: "Add 'Wireless Mouse' to shopping cart and proceed to checkout",
    success: true,
    time: "5.67s",
    actions: "Search item, Add to cart, Open checkout",
    gif: "Available",
  },
  {
    id: 8,
    project: "Autobooks Reports",
    task: "GENERATE_REPORT",
    prompt: "Generate quarterly sales report for Q4 2024",
    success: true,
    time: "8.91s",
    actions: "Select date range, Choose report type, Export",
    gif: "Available",
  },
  {
    id: 9,
    project: "Autocinema Profile",
    task: "UPDATE_PREFERENCES",
    prompt: "Update notification preferences to enable email alerts",
    success: true,
    time: "2.34s",
    actions: "Navigate to settings, Toggle preferences, Save",
    gif: "Available",
  },
  {
    id: 10,
    project: "Autoppia Reviews",
    task: "SUBMIT_REVIEW",
    prompt: "Submit a 5-star review for 'Premium Headphones' with comment",
    success: false,
    time: "3.78s",
    actions: "Form submission failed",
    gif: "Coming soon",
  },
  {
    id: 11,
    project: "Autobooks Customers",
    task: "ADD_CUSTOMER",
    prompt: "Add new customer 'Tech Solutions Inc' with contact details",
    success: true,
    time: "4.12s",
    actions: "Open customer form, Fill details, Submit",
    gif: "Available",
  },
  {
    id: 12,
    project: "Autocinema Recommendations",
    task: "VIEW_SUGGESTED",
    prompt: "Navigate to recommended movies section and view top 5 suggestions",
    success: true,
    time: "2.89s",
    actions: "Scroll to recommendations, Load content",
    gif: "Available",
  },
  {
    id: 13,
    project: "Autoppia Wishlist",
    task: "MANAGE_WISHLIST",
    prompt: "Add 3 items to wishlist and remove 1 existing item",
    success: false,
    time: "5.23s",
    actions: "Partial completion - only 2 items added",
    gif: "Coming soon",
  },
  {
    id: 14,
    project: "Autobooks Payments",
    task: "PROCESS_PAYMENT",
    prompt: "Process payment of $2,450.00 for invoice #INV-2024-1234",
    success: true,
    time: "7.45s",
    actions: "Select invoice, Enter payment details, Confirm",
    gif: "Available",
  },
  {
    id: 15,
    project: "Autocinema Ratings",
    task: "RATE_MOVIE",
    prompt: "Rate 'Inception' with 4.5 stars and mark as favorite",
    success: true,
    time: "1.98s",
    actions: "Select rating, Toggle favorite, Submit",
    gif: "Available",
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
  const logo = isMobile ? 26 : 30;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-logo - 14} y={-logo / 2} width={logo} height={logo}>
        <div className="rounded-md overflow-hidden border border-slate-700 shadow-sm">
          <img
            src={item.logoUrl}
            alt={item.label}
            className="w-full h-full object-cover"
          />
        </div>
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
  const padding = 10;
  const minForInside = 80;

  if (width < minForInside) {
    return (
      <foreignObject
        x={x + width + 6}
        y={y + height / 2 - 12}
        width={160}
        height={24}
      >
        <div className="text-[12px] font-bold text-slate-200">{d.label}</div>
      </foreignObject>
    );
  }

  return (
    <foreignObject
      x={x + padding}
      y={y + height / 2 - 12}
      width={Math.max(100, width - padding - 8)}
      height={24}
    >
      <div
        className="text-[12px] font-extrabold text-white/95"
        style={{
          width: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textShadow: "0 1px 2px rgba(0,0,0,0.6)",
        }}
        title={d.label}
      >
        {d.label}
      </div>
    </foreignObject>
  );
}

/** Right-end medal + score pill */
function MedalAndScoreLabel(props: any) {
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

  const medalBg =
    d.rank === 1
      ? "bg-gradient-to-br from-yellow-400 to-amber-500"
      : d.rank === 2
        ? "bg-gradient-to-br from-gray-400 to-gray-500"
        : d.rank === 3
          ? "bg-gradient-to-br from-orange-400 to-amber-500"
          : "bg-slate-700/80";

  return (
    <foreignObject
      x={right + 6}
      y={y + height / 2 - 14}
      width={110}
      height={28}
    >
      <div className="flex items-center gap-2">
        {d.rank <= 3 && (
          <div
            className={`w-6 h-6 rounded-md ${medalBg} flex items-center justify-center text-[12px] font-bold text-white shadow-md`}
          >
            {d.medal}
          </div>
        )}
        <div className="px-2 py-0.5 rounded-md bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-xs font-bold shadow-md">
          {Number(value).toFixed(1)}%
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
    <div className="rounded-lg border border-slate-700 bg-[#0E1014]/95 px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2">
        <img
          src={p.logoUrl}
          alt={p.label}
          className="h-5 w-5 rounded object-cover border border-slate-700"
        />
        <div className="text-[12px] font-bold text-slate-200">{p.label}</div>
      </div>
      <div className="mt-1 text-sm font-extrabold text-cyan-300">
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

  const rowHeight = isMobile ? 70 : 82;
  const barSize = isMobile ? 26 : 32;
  const chartHeight = rowHeight * chartData.length;

  // logos-only gutter
  const yAxisWidth = isMobile ? 40 : 48;

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
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                <FaTrophy className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <Title
                as="h1"
                className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                Infinite Web Arena Leaderboard
              </Title>
            </div>
            <Text className="text-base sm:text-lg text-cyan-300 max-w-3xl mx-auto mb-6">
              Top performing web agents ranked by IWA Score
            </Text>
          </div>
        </div>
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
          <div className="relative group">
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <FaCrown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-300">Champion</p>
                  <p className="text-sm text-amber-200/70">
                    {leaderboardData[0].name}
                  </p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">
                  {leaderboardData[0].score}
                </span>
                <span className="text-2xl font-bold text-amber-400">%</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                  <FaChartBar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-300">
                    Average Score
                  </p>
                  <p className="text-sm text-blue-200/70">All Agents</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">{avg}</span>
                <span className="text-2xl font-bold text-blue-400">%</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <FaBolt className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-300">
                    Total Agents
                  </p>
                  <p className="text-sm text-purple-200/70">Competing</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">
                  {leaderboardData.length}
                </span>
                <span className="text-2xl font-bold text-purple-400">AI</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chart Section (UPDATED with your chart code) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8 sm:mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 blur-2xl rounded-3xl"></div>

          <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <FaChartBar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">
                    IWA Performance Score
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                    Real-time rankings
                  </p>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 8, right: 92, left: 80, bottom: 8 }}
                barSize={barSize}
                barCategoryGap="22%"
              >
                <defs>
                  <linearGradient id="coolBar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="40%" stopColor="#06B6D4" />
                    <stop offset="80%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#10B981" />
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
                  stroke="#1C2430"
                  strokeWidth={1}
                />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fill: "#9AA4B2", fontSize: 12, fontWeight: 700 }}
                  axisLine={{ stroke: "#1E2836", strokeWidth: 1 }}
                  tickLine={{ stroke: "#1E2836", strokeWidth: 1 }}
                />

                {/* logos only on Y axis */}
                <YAxis
                  type="category"
                  dataKey="label"
                  width={yAxisWidth}
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
                  stroke="#06B6D4"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  label={{
                    value: `Avg: ${avg}%`,
                    fill: "#22D3EE",
                    fontWeight: 800,
                    position: "insideBottomLeft",
                    fontSize: 12,
                  }}
                />

                <Bar
                  dataKey="score"
                  fill="url(#coolBar)"
                  radius={[12, 12, 12, 12]}
                  filter="url(#barGlow)"
                >
                  {/* name inside the bar (left) */}
                  <LabelList content={<NameInsideBarLabel />} />
                  {/* medal + score pill at bar end (right) */}
                  <LabelList dataKey="score" content={<MedalAndScoreLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-700/50">
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

        {/* Benchmark Tasks — ONLY Project + Prompt (Card Grid) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative mb-8 sm:mb-12"
        >
          <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <FaFire className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-100">
                    Benchmark Tasks
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                    Web project and its benchmark prompt
                  </p>
                </div>
              </div>
              <button
                onClick={downloadTasks}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition-all shadow-lg hover:shadow-xl"
              >
                <FaDownload className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
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
