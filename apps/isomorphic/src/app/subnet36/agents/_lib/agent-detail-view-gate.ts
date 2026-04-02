/**
 * Pure logic for agent detail page: loading skeleton vs fatal error card.
 * Centralized so we can test every combination and avoid "Agent not found" flashes.
 */

export type AgentDetailViewMode = "current" | "historical" | "runs";

export type AgentDetailViewGateInput = {
  /** False when route param id is missing (hydration / edge). Never show error until true. */
  hasRouteAgentId: boolean;
  viewMode: AgentDetailViewMode;
  /** Resolved API payload for GET agent (null = no successful response yet for this key). */
  agentDetail: unknown | null;
  /** agentDetail?.agent — separate field keeps this module free of repository types. */
  agentFromPayload: unknown | null;
  effectiveAgent: unknown | null;
  agentFetchLoading: boolean;
  agentFetchError: string | null;
  minerHistorical: unknown | null;
  minerHistoricalLoading: boolean;
  minerRoundDetails: unknown | null;
  minerRoundDetailsLoading: boolean;
};

/**
 * Full-page loading (skeleton). When true, the fatal error card must not render.
 */
export function computeAgentDetailPageShowLoading(
  input: AgentDetailViewGateInput
): boolean {
  if (!input.hasRouteAgentId) {
    return true;
  }

  if (input.viewMode === "historical" && input.minerHistoricalLoading) {
    return true;
  }

  if (
    input.viewMode !== "historical" &&
    !input.minerRoundDetails &&
    input.minerRoundDetailsLoading
  ) {
    return true;
  }

  // Current / runs: never treat as "ready" until we have agent payload or an error.
  // Covers: minerRoundDetails finished instantly with no round in URL while useAgent is in flight;
  // and any frame where loading is still false before layout effect / fetch starts.
  const awaitingAgentPayload =
    input.viewMode !== "historical" &&
    input.agentFetchError == null &&
    input.effectiveAgent == null &&
    (Boolean(input.agentFetchLoading) || input.agentDetail === null);

  return awaitingAgentPayload;
}

/**
 * Fatal error card ("Error loading agent" / "Agent not found"). Only when not loading.
 */
export function computeAgentDetailPageShowFatalError(
  input: AgentDetailViewGateInput,
  showLoading: boolean
): boolean {
  if (showLoading) {
    return false;
  }

  const hasHistoricalData =
    input.viewMode === "historical" && Boolean(input.minerHistorical);
  const hasRoundDetailsData =
    input.viewMode !== "historical" &&
    (Boolean(input.minerRoundDetails) || Boolean(input.agentFromPayload));

  return (
    input.effectiveAgent == null &&
    !hasHistoricalData &&
    !hasRoundDetailsData
  );
}
