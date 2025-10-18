import type { ProcessedTimeline } from "./experience";

type RawRound = {
  round: number;
  scores: Record<string, number>;
};

const roster = [
  {
    id: "miner_alpha",
    name: "Miner Alpha",
    color: "#2563EB",
    image: "/miners/1.svg",
    order: 0,
  },
  {
    id: "miner_beta",
    name: "Miner Beta",
    color: "#14B8A6",
    image: "/miners/2.svg",
    order: 1,
  },
  {
    id: "miner_gamma",
    name: "Miner Gamma",
    color: "#F97316",
    image: "/miners/3.svg",
    order: 2,
  },
  {
    id: "miner_delta",
    name: "Miner Delta",
    color: "#8B5CF6",
    image: "/miners/4.svg",
    order: 3,
  },
  {
    id: "miner_epsilon",
    name: "Miner Epsilon",
    color: "#EC4899",
    image: "/miners/5.svg",
    order: 4,
  },
] satisfies ProcessedTimeline["roster"];

const rawRounds: RawRound[] = [
  {
    round: 1,
    scores: {
      miner_alpha: 8.1,
      miner_beta: 7.6,
      miner_gamma: 6.9,
      miner_delta: 6.2,
      miner_epsilon: 5.7,
    },
  },
  {
    round: 2,
    scores: {
      miner_alpha: 8.05,
      miner_beta: 7.65,
      miner_gamma: 7.1,
      miner_delta: 6.3,
      miner_epsilon: 5.85,
    },
  },
  {
    round: 3,
    scores: {
      miner_alpha: 7.95,
      miner_beta: 7.4,
      miner_gamma: 7.35,
      miner_delta: 6.45,
      miner_epsilon: 5.9,
    },
  },
  {
    round: 4,
    scores: {
      miner_alpha: 8.2,
      miner_beta: 7.8,
      miner_gamma: 7.2,
      miner_delta: 6.55,
      miner_epsilon: 5.95,
    },
  },
  {
    round: 5,
    scores: {
      miner_alpha: 8.15,
      miner_beta: 7.88,
      miner_gamma: 7.25,
      miner_delta: 6.6,
      miner_epsilon: 6.05,
    },
  },
  {
    round: 6,
    scores: {
      miner_alpha: 8.0,
      miner_beta: 8.05,
      miner_gamma: 7.3,
      miner_delta: 6.75,
      miner_epsilon: 6.1,
    },
  },
  {
    round: 7,
    scores: {
      miner_alpha: 7.9,
      miner_beta: 8.1,
      miner_gamma: 7.45,
      miner_delta: 6.82,
      miner_epsilon: 6.2,
    },
  },
  {
    round: 8,
    scores: {
      miner_alpha: 8.05,
      miner_beta: 8.0,
      miner_gamma: 7.6,
      miner_delta: 6.9,
      miner_epsilon: 6.25,
    },
  },
  {
    round: 9,
    scores: {
      miner_alpha: 8.2,
      miner_beta: 7.95,
      miner_gamma: 7.7,
      miner_delta: 6.95,
      miner_epsilon: 6.3,
    },
  },
  {
    round: 10,
    scores: {
      miner_alpha: 8.25,
      miner_beta: 8.1,
      miner_gamma: 7.6,
      miner_delta: 7.05,
      miner_epsilon: 6.4,
    },
  },
  {
    round: 11,
    scores: {
      miner_alpha: 8.15,
      miner_beta: 8.2,
      miner_gamma: 7.55,
      miner_delta: 7.1,
      miner_epsilon: 6.45,
    },
  },
  {
    round: 12,
    scores: {
      miner_alpha: 8.05,
      miner_beta: 8.25,
      miner_gamma: 7.5,
      miner_delta: 7.2,
      miner_epsilon: 6.5,
    },
  },
];

const baseDate = new Date("2024-08-01T12:00:00.000Z");
const roundDurationSeconds = 600;
const previousRanks = new Map<string, number>();
const previousScores = new Map<string, number>();

const timeline = rawRounds.map((entry, index) => {
  const date = new Date(
    baseDate.getTime() + index * roundDurationSeconds * 1000
  ).toISOString();

  const miners = Object.entries(entry.scores).map(([id, score]) => {
    const profile =
      roster.find((miner) => miner.id === id) ??
      {
        id,
        name: id.replace(/[_-]/g, " ").toUpperCase(),
        color: "#0F172A",
        image: "/miners/1.svg",
        order: roster.length,
      };

    const previousScore = previousScores.get(id);

    return {
      ...profile,
      score,
      rank: 0,
      previousRank: previousRanks.has(id) ? previousRanks.get(id)! : null,
      rankChange: 0,
      scoreChange: Number(
        (score - (previousScore ?? score)).toFixed(2)
      ),
    };
  });

  miners.sort((a, b) => b.score - a.score);

  miners.forEach((miner, rankIndex) => {
    const nextRank = rankIndex + 1;
    const priorRank = previousRanks.get(miner.id);
    const baselineRank = priorRank ?? nextRank;

    miner.rank = nextRank;
    miner.previousRank = priorRank ?? null;
    miner.rankChange = baselineRank - nextRank;
  });

  miners.forEach((miner) => {
    previousRanks.set(miner.id, miner.rank);
    previousScores.set(miner.id, miner.score);
  });

  return {
    round: entry.round,
    date,
    miners,
  };
});

const meta = {
  subnet_id: "subnet36",
  start_round: rawRounds[0]?.round ?? 0,
  end_round: rawRounds[rawRounds.length - 1]?.round ?? 0,
  round_count: rawRounds.length,
  round_duration_seconds: roundDurationSeconds,
  generated_at: new Date(
    baseDate.getTime() + rawRounds.length * roundDurationSeconds * 1000
  ).toISOString(),
  query: {
    rounds: rawRounds.length,
    end_round: rawRounds[rawRounds.length - 1]?.round ?? null,
    seconds_back: rawRounds.length * roundDurationSeconds,
    miners: roster.length,
  },
  inferred_round_count: rawRounds.length,
} satisfies ProcessedTimeline["meta"];

export const mockSubnetTimeline: ProcessedTimeline = {
  roster,
  timeline,
  subnetId: "subnet36",
  meta,
};
