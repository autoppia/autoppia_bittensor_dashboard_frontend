export const routes = {
  home: "/land",
  overview: "/overview",
  rounds: "/rounds",
  agents: "/agents",
  agent_run: "/agent-run",
  agent_test: "/test-agent",
  tasks: "/tasks",
  websites: "/websites",
  websiteDetail: (name: string) => `/websites/${name.toLowerCase()}`,
  testAgent: "/test-agent",
}
