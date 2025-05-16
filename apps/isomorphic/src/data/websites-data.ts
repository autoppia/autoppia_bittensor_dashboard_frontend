export type WebsiteDataType = {
  name: string;
  value: string;
  href: string;
  origin: string;
  totalTasks: number[]; // Array of [easy, medium, hard] task counts
}

export const websitesData = [
  {
    name: "Bittensor",
    value: "bittensor",
    href: "https://bittensor.com",
    origin: "bittensor",
    totalTasks: [25, 15, 8] // [easy, medium, hard]
  },
  {
    name: "Autoppia",
    value: "autoppia",
    href: "https://autoppia.com",
    origin: "autoppia",
    totalTasks: [32, 18, 10]
  },
  {
    name: "T3rn",
    value: "t3rn",
    href: "https://t3rn.io",
    origin: "t3rn",
    totalTasks: [20, 12, 6]
  },
  {
    name: "Subtensor",
    value: "subtensor",
    href: "https://subtensor.network",
    origin: "subtensor",
    totalTasks: [28, 16, 9]
  },
  {
    name: "Taostats",
    value: "taostats",
    href: "https://taostats.io",
    origin: "taostats",
    totalTasks: [22, 14, 7]
  },
  {
    name: "Tao Explorer",
    value: "tao_explorer",
    href: "https://explorer.tao.network",
    origin: "explorer",
    totalTasks: [18, 11, 5]
  },
  {
    name: "Finney",
    value: "finney",
    href: "https://finney.org",
    origin: "finney",
    totalTasks: [30, 17, 9]
  },
  {
    name: "Cortex",
    value: "cortex",
    href: "https://cortexlabs.ai",
    origin: "cortexlabs",
    totalTasks: [24, 13, 7]
  },
]
