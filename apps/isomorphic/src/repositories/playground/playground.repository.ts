import type {
  RunAgentBenchmarkPayload,
  RunAgentBenchmarkResponse,
} from "./playground.types";

const TEST_AGENT_BENCHMARK_ENDPOINT =
  "https://api-benchmark.autoppia.com/test-your-agent";

class PlaygroundRepository {
  private readonly benchmarkEndpoint = TEST_AGENT_BENCHMARK_ENDPOINT;

  async runAgentBenchmark(
    payload: RunAgentBenchmarkPayload
  ): Promise<RunAgentBenchmarkResponse> {
    const response = await fetch(this.benchmarkEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as RunAgentBenchmarkResponse;
  }
}

export const playgroundRepository = new PlaygroundRepository();
export const PLAYGROUND_BENCHMARK_ENDPOINT = TEST_AGENT_BENCHMARK_ENDPOINT;

