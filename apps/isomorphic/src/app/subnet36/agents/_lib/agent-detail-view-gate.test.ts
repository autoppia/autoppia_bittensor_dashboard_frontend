import { describe, expect, it } from "vitest";

import {
  computeAgentDetailPageShowFatalError,
  computeAgentDetailPageShowLoading,
  type AgentDetailViewGateInput,
} from "./agent-detail-view-gate";

const base = (): AgentDetailViewGateInput => ({
  hasRouteAgentId: true,
  viewMode: "current",
  agentDetail: null,
  agentFromPayload: null,
  effectiveAgent: null,
  agentFetchLoading: false,
  agentFetchError: null,
  minerHistorical: null,
  minerHistoricalLoading: false,
  minerRoundDetails: null,
  minerRoundDetailsLoading: false,
});

describe("computeAgentDetailPageShowLoading", () => {
  it("loads while route id is missing (never flash error before params)", () => {
    const input = { ...base(), hasRouteAgentId: false, agentFetchLoading: false };
    expect(computeAgentDetailPageShowLoading(input)).toBe(true);
  });

  it("historical: loads while miner historical is loading", () => {
    const input = {
      ...base(),
      viewMode: "historical" as const,
      minerHistoricalLoading: true,
    };
    expect(computeAgentDetailPageShowLoading(input)).toBe(true);
  });

  it("current: loads while miner round details loading when no round payload yet", () => {
    const input = {
      ...base(),
      minerRoundDetailsLoading: true,
      minerRoundDetails: null,
    };
    expect(computeAgentDetailPageShowLoading(input)).toBe(true);
  });

  it("REGRESSION: current mode, round details idle, agent API not started (false loading + null detail) → still loading", () => {
    const input: AgentDetailViewGateInput = {
      ...base(),
      viewMode: "current",
      minerRoundDetails: null,
      minerRoundDetailsLoading: false,
      agentFetchLoading: false,
      agentDetail: null,
      agentFetchError: null,
      effectiveAgent: null,
    };
    expect(computeAgentDetailPageShowLoading(input)).toBe(true);
  });

  it("REGRESSION: same as above in runs mode", () => {
    const input: AgentDetailViewGateInput = {
      ...base(),
      viewMode: "runs",
      minerRoundDetails: null,
      minerRoundDetailsLoading: false,
      agentFetchLoading: false,
      agentDetail: null,
      effectiveAgent: null,
    };
    expect(computeAgentDetailPageShowLoading(input)).toBe(true);
  });

  it("current: loading true with null agent → loading", () => {
    const input = {
      ...base(),
      agentFetchLoading: true,
      agentDetail: null,
    };
    expect(computeAgentDetailPageShowLoading(input)).toBe(true);
  });

  it("current: fetch finished with agent object but effectiveAgent still null → not loading from agentDetail branch if detail non-null", () => {
    const payload = { agent: { uid: 1 } };
    const input = {
      ...base(),
      agentFetchLoading: false,
      agentDetail: payload,
      agentFromPayload: payload.agent,
      effectiveAgent: null,
    };
    // agentDetail !== null → awaitingAgentPayload requires effectiveAgent null AND (loading OR detail null)
    expect(computeAgentDetailPageShowLoading(input)).toBe(false);
  });

  it("current: no round in URL path — miner details not loading is not enough; still await agent", () => {
    const input = {
      ...base(),
      minerRoundDetails: null,
      minerRoundDetailsLoading: false,
      agentFetchLoading: true,
      agentDetail: null,
    };
    expect(computeAgentDetailPageShowLoading(input)).toBe(true);
  });

  it("historical: not loading historical does not force agent skeleton when historical data already present", () => {
    const input = {
      ...base(),
      viewMode: "historical" as const,
      minerHistoricalLoading: false,
      minerHistorical: { miner: {} },
      agentFetchLoading: false,
      agentDetail: null,
      effectiveAgent: null,
    };
    expect(computeAgentDetailPageShowLoading(input)).toBe(false);
  });
});

describe("computeAgentDetailPageShowFatalError", () => {
  it("never fatal while loading", () => {
    const input = {
      ...base(),
      agentFetchLoading: true,
      agentDetail: null,
    };
    const loading = computeAgentDetailPageShowLoading(input);
    expect(loading).toBe(true);
    expect(computeAgentDetailPageShowFatalError(input, loading)).toBe(false);
  });

  it("fatal when settled with no agent, no historical, no round details", () => {
    const input = {
      ...base(),
      agentFetchLoading: false,
      agentDetail: { agent: null },
      agentFromPayload: null,
      effectiveAgent: null,
      agentFetchError: null,
    };
    const loading = computeAgentDetailPageShowLoading(input);
    expect(loading).toBe(false);
    expect(computeAgentDetailPageShowFatalError(input, loading)).toBe(true);
  });

  it("not fatal when agent row exists on payload", () => {
    const agent = { uid: 168 };
    const input = {
      ...base(),
      agentFetchLoading: false,
      agentDetail: { agent },
      agentFromPayload: agent,
      effectiveAgent: agent,
    };
    const loading = computeAgentDetailPageShowLoading(input);
    expect(computeAgentDetailPageShowFatalError(input, loading)).toBe(false);
  });

  it("not fatal on API error (handled by error UI copy in page)", () => {
    const input = {
      ...base(),
      agentFetchLoading: false,
      agentDetail: null,
      agentFetchError: "Network error",
    };
    const loading = computeAgentDetailPageShowLoading(input);
    expect(loading).toBe(false);
    expect(computeAgentDetailPageShowFatalError(input, loading)).toBe(true);
  });

  it("exhaustive: no fatal+loading for random current-mode grids", () => {
    const loadings = [true, false];
    const details = [null, { agent: null }, { agent: { uid: 1 } }];
    const effs = [null, { uid: 1 }];
    const errors = [null, "404 Not Found"];

    for (const agentFetchLoading of loadings) {
      for (const agentDetail of details) {
        for (const effectiveAgent of effs) {
          for (const agentFetchError of errors) {
            const agentFromPayload =
              agentDetail &&
              typeof agentDetail === "object" &&
              "agent" in agentDetail
                ? (agentDetail as { agent: unknown }).agent
                : null;
            const input: AgentDetailViewGateInput = {
              ...base(),
              agentFetchLoading,
              agentDetail,
              agentFromPayload,
              effectiveAgent,
              agentFetchError,
            };
            const showLoading = computeAgentDetailPageShowLoading(input);
            const showFatal = computeAgentDetailPageShowFatalError(input, showLoading);
            expect(showLoading && showFatal).toBe(false);
          }
        }
      }
    }
  });
});
