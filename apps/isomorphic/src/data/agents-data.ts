export type AgentDataType = {
  id: string;
  name: string;
  href: string;
  imageUrl: string;
  successfulTasks: Record<string, [number, number, number]>; // [easy, medium, hard]
}

export const agentsData: AgentDataType[] = [
  {
    id: "subnet-36-miner-6",
    name: 'Subnet 36 Miner 6',
    href: "/agents/subnet-36-miner-6",
    imageUrl: '/icons/bittensor.webp',
    successfulTasks: {
      "bittensor": [23, 13, 5],
      "autoppia": [30, 16, 7],
      "t3rn": [17, 10, 3],
      "subtensor": [25, 14, 6],
      "taostats": [19, 12, 4],
      "tao_explorer": [16, 9, 3],
      "finney": [28, 15, 6],
      "cortex": [22, 11, 5]
    }
  },
  {
    id: "subnet-36-miner-9",
    name: 'Subnet 36 Miner 9',
    href: "/agents/subnet-36-miner-9",
    imageUrl: '/icons/bittensor.webp',
    successfulTasks: {
      "bittensor": [21, 12, 6],
      "autoppia": [31, 15, 6],
      "t3rn": [16, 9, 4],
      "subtensor": [27, 13, 5],
      "taostats": [18, 11, 5],
      "tao_explorer": [15, 8, 3],
      "finney": [29, 14, 5],
      "cortex": [20, 10, 4]
    }
  },
  {
    id: "subnet-36-miner-22",
    name: 'Subnet 36 Miner 22',
    href: "/agents/subnet-36-miner-22",
    imageUrl: '/icons/bittensor.webp',
    successfulTasks: {
      "bittensor": [22, 11, 4],
      "autoppia": [28, 14, 7],
      "t3rn": [18, 9, 3],
      "subtensor": [24, 12, 6],
      "taostats": [20, 10, 4],
      "tao_explorer": [14, 7, 2],
      "finney": [26, 13, 5],
      "cortex": [21, 9, 4]
    }
  },
  {
    id: "subnet-36-miner-34",
    name: 'Subnet 36 Miner 34',
    href: "/agents/subnet-36-miner-34",
    imageUrl: '/icons/bittensor.webp',
    successfulTasks: {
      "bittensor": [20, 10, 5],
      "autoppia": [29, 13, 5],
      "t3rn": [15, 8, 3],
      "subtensor": [26, 11, 4],
      "taostats": [17, 9, 3],
      "tao_explorer": [13, 6, 2],
      "finney": [27, 12, 4],
      "cortex": [19, 8, 3]
    }
  },
  {
    id: "subnet-36-miner-57",
    name: 'Subnet 36 Miner 57',
    href: "/agents/subnet-36-miner-57",
    imageUrl: '/icons/bittensor.webp',
    successfulTasks: {
      "bittensor": [19, 9, 4],
      "autoppia": [26, 12, 5],
      "t3rn": [14, 7, 2],
      "subtensor": [23, 10, 4],
      "taostats": [16, 8, 3],
      "tao_explorer": [12, 5, 2],
      "finney": [25, 11, 4],
      "cortex": [18, 7, 3]
    }
  },
  {
    id: "anthropic-computer-use",
    name: 'Anthropic Computer Use',
    href: "/agents/anthropic-computer-use",
    imageUrl: '/icons/anthropic.webp',
    successfulTasks: {
      "bittensor": [17, 8, 3],
      "autoppia": [25, 10, 4],
      "t3rn": [13, 6, 2],
      "subtensor": [22, 9, 3],
      "taostats": [15, 7, 2],
      "tao_explorer": [11, 5, 1],
      "finney": [24, 9, 3],
      "cortex": [16, 6, 2]
    }
  },
  {
    id: "browser-use-with-gpt-4o",
    name: 'Browser Use with GPT-4o',
    href: "/agents/browser-use-with-gpt-4o",
    imageUrl: '/icons/browser-use.webp',
    successfulTasks: {
      "bittensor": [15, 7, 2],
      "autoppia": [23, 9, 3],
      "t3rn": [12, 5, 1],
      "subtensor": [20, 8, 3],
      "taostats": [13, 6, 2],
      "tao_explorer": [10, 4, 1],
      "finney": [22, 8, 2],
      "cortex": [14, 5, 2]
    }
  },
  {
    id: "browser-use-with-claude-3-7-sonnet",
    name: 'Browser Use with Claude 3.7 Sonnet',
    href: "/agents/browser-use-with-claude-3-7-sonnet",
    imageUrl: '/icons/browser-use.webp',
    successfulTasks: {
      "bittensor": [13, 6, 2],
      "autoppia": [21, 8, 2],
      "t3rn": [10, 4, 1],
      "subtensor": [18, 7, 2],
      "taostats": [11, 5, 1],
      "tao_explorer": [8, 3, 1],
      "finney": [19, 7, 2],
      "cortex": [12, 4, 1]
    }
  },
  {
    id: "stagehand-open-operator-with-gpt-4o",
    name: 'Stagehand Open Operator with GPT-4o',
    href: "/agents/stagehand-open-operator-with-gpt-4o",
    imageUrl: '/icons/stagehand.webp',
    successfulTasks: {
      "bittensor": [11, 5, 1],
      "autoppia": [19, 7, 2],
      "t3rn": [9, 3, 1],
      "subtensor": [16, 6, 2],
      "taostats": [10, 4, 1],
      "tao_explorer": [7, 3, 1],
      "finney": [17, 6, 1],
      "cortex": [10, 3, 1]
    }
  },
  {
    id: "openai-cua",
    name: 'OpenAI CUA',
    href: "/agents/openai-cua",
    imageUrl: '/icons/openai.webp',
    successfulTasks: {
      "bittensor": [9, 4, 1],
      "autoppia": [17, 6, 1],
      "t3rn": [7, 3, 1],
      "subtensor": [14, 5, 1],
      "taostats": [8, 3, 1],
      "tao_explorer": [6, 2, 0],
      "finney": [15, 5, 1],
      "cortex": [9, 3, 1]
    }
  },
];
