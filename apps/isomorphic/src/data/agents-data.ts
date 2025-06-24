export type AgentDataType = {
  id: string;
  name: string;
  href: string;
  imageUrl: string;
  /** casos de uso inventados, 1‑3 */
  usecase1: number;
  usecase2: number;
  usecase3: number;
  /** porcentaje de éxito global mostrado en el gráfico */
  successRate: number;
};

/* ─────────────────────────  top‑5 agentes ───────────────────────── */
export const agentsData: AgentDataType[] = [
  {
    id: "subnet36-top",
    name: "Autoppia Bittensor",
    href: "/agents/subnet36-top",
    imageUrl: "/icons/bittensor.webp",
    usecase1: 64,
    usecase2: 52,
    usecase3: 43,
    successRate: 68.4,
  },
  {
    id: "openai-cua",
    name: "OpenAI CUA",
    href: "/agents/openai-cua",
    imageUrl: "/icons/openai.webp",
    usecase1: 85,
    usecase2: 72,
    usecase3: 60,
    successRate: 65.2,
  },
  {
    id: "browser-gpt-o3",
    name: "Browser-Use GPT o3",
    href: "/agents/browser-gpt-o3",
    imageUrl: "/icons/browser-use.webp",
    usecase1: 68,
    usecase2: 56,
    usecase3: 47,
    successRate: 59.2,
  },
  {
    id: "browser-sonnet4",
    name: "Browser-Use Sonnet 4",
    href: "/agents/browser-sonnet4",
    imageUrl: "/icons/browser-use.webp",
    usecase1: 70,
    usecase2: 58,
    usecase3: 49,
    successRate: 54.1,
  },
  {
    id: "anthropic-cua",
    name: "Anthropic CUA",
    href: "/agents/anthropic-cua",
    imageUrl: "/icons/anthropic.webp",
    usecase1: 78,
    usecase2: 66,
    usecase3: 55,
    successRate: 45.2,
  },
];
