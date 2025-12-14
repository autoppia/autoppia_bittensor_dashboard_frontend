/**
 * Mock data for overview API endpoints
 * Used when the backend server is not available
 */

import type {
  OverviewMetrics,
  ValidatorData,
  OverviewRoundData,
  LeaderboardData,
  SubnetStatistics,
} from "./overview/overview.types";

export const mockOverviewMetrics: OverviewMetrics = {
  topReward: 0.95,
  topMinerUid: 80,
  topMinerName: "Achilles",
  totalWebsites: 13,
  totalValidators: 6,
  totalMiners: 156,
  currentRound: 42,
  metricsRound: 41,
  subnetVersion: "7.0.0",
  lastUpdated: new Date().toISOString(),
};

export const mockValidators: ValidatorData[] = [
  {
    id: "autoppia",
    name: "Autoppia",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Autoppia.png",
    status: "Sending Tasks",
    weight: 1722467.28,
    trust: 1.0,
    version: 7,
    totalTasks: 5787,
    currentTask:
      "Login for the following username:user<web_agent_id> and password:password123. Modify your profile to ensure that your favorite genres are NOT in the list 'Sci-Fi'.",
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    uptime: 99.8,
    stake: 1250000.0,
    emission: 0.85,
  },
  {
    id: "tao5",
    name: "tao5",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/tao5.png",
    status: "Evaluating",
    weight: 217234.77,
    trust: 0.9687,
    version: 4,
    totalTasks: 2465,
    currentTask:
      "Show details for a movie that was NOT released in the year '1990'",
    lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    uptime: 98.5,
    stake: 1000000.0,
    emission: 0.8,
  },
  {
    id: "roundtable21",
    name: "RoundTable21",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/RoundTable21.png",
    status: "Waiting",
    weight: 200261.91,
    trust: 0.9676,
    version: 5,
    totalTasks: 3465,
    currentTask:
      "Fill out the contact form with a name equal to 'Linda', a message that does not contain 'Just a quick question', and an email that contains 'jane@doe.com'.",
    lastSeen: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
    uptime: 97.2,
    stake: 800000.0,
    emission: 0.75,
  },
  {
    id: "yuma",
    name: "Yuma",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Yuma.png",
    status: "Evaluating",
    weight: 143629.17,
    trust: 0.9665,
    version: 5,
    totalTasks: 2465,
    currentTask:
      "Delete a film whose year is NOT in the list [2014, 1990, 1994] and whose name is NOT equal to 'The Matrix' with a rating equal to 4.6.",
    lastSeen: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
    uptime: 96.8,
    stake: 600000.0,
    emission: 0.7,
  },
  {
    id: "kraken",
    name: "Kraken",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Kraken.png",
    status: "Sending Tasks",
    weight: 125432.45,
    trust: 0.9654,
    version: 6,
    totalTasks: 1890,
    currentTask: "Search for products with price range between $50 and $200",
    lastSeen: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 minutes ago
    uptime: 95.5,
    stake: 500000.0,
    emission: 0.65,
  },
  {
    id: "other",
    name: "Other",
    hotkey: "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
    icon: "/validators/Other.png",
    status: "Waiting",
    weight: 98765.32,
    trust: 0.9632,
    version: 3,
    totalTasks: 1234,
    currentTask: "Navigate to the about page and verify contact information",
    lastSeen: new Date(Date.now() - 6 * 60 * 1000).toISOString(), // 6 minutes ago
    uptime: 94.1,
    stake: 400000.0,
    emission: 0.6,
  },
];

export const mockCurrentRound: OverviewRoundData = {
  id: 42,
  startBlock: 2847000,
  endBlock: 2848000,
  current: true,
  startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
  status: "active",
  totalTasks: 1247,
  completedTasks: 892,
  averageScore: 0.78,
  topScore: 0.95,
};

export const mockLeaderboard: LeaderboardData[] = [
  {
    round: 42,
    subnet36: 0.95,
    openai_cua: 0.87,
    anthropic_cua: 0.89,
    browser_use: 0.92,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    round: 41,
    subnet36: 0.92,
    openai_cua: 0.85,
    anthropic_cua: 0.87,
    browser_use: 0.9,
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    round: 40,
    subnet36: 0.89,
    openai_cua: 0.83,
    anthropic_cua: 0.85,
    browser_use: 0.88,
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    round: 39,
    subnet36: 0.87,
    openai_cua: 0.81,
    anthropic_cua: 0.83,
    browser_use: 0.86,
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    round: 38,
    subnet36: 0.85,
    openai_cua: 0.79,
    anthropic_cua: 0.81,
    browser_use: 0.84,
    timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
  },
];

export const mockSubnetStatistics: SubnetStatistics = {
  totalStake: 4550000.0,
  totalEmission: 4.35,
  averageTrust: 0.97,
  networkUptime: 99.2,
  activeValidators: 6,
  registeredMiners: 156,
  totalTasksCompleted: 892,
  averageTaskScore: 0.78,
  lastUpdated: new Date().toISOString(),
};

export const mockNetworkStatus = {
  status: "healthy" as const,
  message: "All systems operational",
  lastChecked: new Date().toISOString(),
  activeValidators: 6,
  networkLatency: 45,
};

export const mockRecentActivity = {
  activities: [
    {
      id: "act-1",
      type: "task_completed" as const,
      message: "Autoppia Agent completed task 'Search for wireless headphones'",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      metadata: { agentId: "autoppia-agent", taskId: "task-123", score: 0.95 },
    },
    {
      id: "act-2",
      type: "round_started" as const,
      message: "Round 42 started with 156 active miners",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: { roundId: 42, miners: 156 },
    },
    {
      id: "act-3",
      type: "validator_joined" as const,
      message: "New validator 'Kraken' joined the network",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      metadata: { validatorId: "kraken", weight: 125432.45 },
    },
    {
      id: "act-4",
      type: "miner_registered" as const,
      message: "New miner registered: Agent #157",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      metadata: { minerId: 157, validator: "autoppia" },
    },
    {
      id: "act-5",
      type: "task_completed" as const,
      message: "Browser GPT O3 completed task 'Add product to cart'",
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      metadata: { agentId: "browser-gpt-o3", taskId: "task-124", score: 0.92 },
    },
  ],
  total: 5,
};

export const mockPerformanceTrends = {
  trends: [
    {
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      averageScore: 0.76,
      totalTasks: 1156,
      activeValidators: 6,
      networkUptime: 98.8,
    },
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      averageScore: 0.77,
      totalTasks: 1189,
      activeValidators: 6,
      networkUptime: 99.1,
    },
    {
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      averageScore: 0.78,
      totalTasks: 1203,
      activeValidators: 6,
      networkUptime: 99.3,
    },
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      averageScore: 0.79,
      totalTasks: 1215,
      activeValidators: 6,
      networkUptime: 99.0,
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      averageScore: 0.78,
      totalTasks: 1234,
      activeValidators: 6,
      networkUptime: 99.2,
    },
    {
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      averageScore: 0.8,
      totalTasks: 1240,
      activeValidators: 6,
      networkUptime: 99.4,
    },
    {
      date: new Date().toISOString(),
      averageScore: 0.78,
      totalTasks: 1247,
      activeValidators: 6,
      networkUptime: 99.2,
    },
  ],
  period: "7 days",
};
