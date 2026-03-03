/**
 * Agents API Usage Examples
 * Demonstrates how to use the agents API service and hooks
 */

import Image from 'next/image';
import React, { useState } from 'react';
import { agentsRepository } from '../api/agents.service';
import {
  useAgents,
  useAgent,
  useAgentPerformance,
  useAgentRuns,
  useAgentActivity,
  useAgentStatistics,
  useTopAgents,
  useAgentSummary,
  useAgentRealtime,
} from '../hooks/useAgents';

// Example 1: Basic Agent List Component
export function AgentsListExample() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('');

  const { data, loading, error, refetch } = useAgents({
    page,
    limit: 10,
    type: type as any,
    search,
    sortBy: 'averageScore',
    sortOrder: 'desc',
  });

  if (loading) return <div>Loading agents...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Agents List</h2>

      {/* Search and Filters */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="autoppia">Autoppia</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="browser-use">Browser-Use</option>
        </select>
        <button onClick={refetch}>Refresh</button>
      </div>

      {/* Agents List */}
      <div>
        {data?.data.agents.map((agent) => (
          <div key={agent.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>{agent.name}</h3>
            <p>Type: {agent.type}</p>
            <p>Status: {agent.status}</p>
            <p>Average Score: {agent.averageScore.toFixed(2)}</p>
            <p>Success Rate: {agent.successRate.toFixed(1)}%</p>
            <p>Total Runs: {agent.totalRuns}</p>
            <p>Last Seen: {new Date(agent.lastSeen).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>Page {page} of {Math.ceil((data?.data.total || 0) / 10)}</span>
        <button
          disabled={!data?.data.agents.length || data.data.agents.length < 10}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Example 2: Agent Details Component
export function AgentDetailsExample({ agentId }: { agentId: string }) {
  const { data: agent, loading, error } = useAgent(agentId);
  const { data: performance } = useAgentPerformance(agentId, { timeRange: '7d' });
  const { data: recentRuns } = useAgentRuns(agentId, { limit: 5 });

  if (loading) return <div>Loading agent details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!agent) return <div>Agent not found</div>;

  return (
    <div>
      <h2>{agent.name}</h2>

      {/* Agent Info */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <Image
          src={agent.imageUrl}
          alt={agent.name}
          width={64}
          height={64}
        />
        <div>
          <p><strong>Type:</strong> {agent.type}</p>
          <p><strong>Version:</strong> {agent.version}</p>
          <p><strong>Status:</strong> {agent.status}</p>
          <p><strong>Description:</strong> {agent.description}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Performance (Last 7 Days)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div>
              <strong>Average Score:</strong><br />
              {performance.averageScore.toFixed(2)}
            </div>
            <div>
              <strong>Success Rate:</strong><br />
              {performance.successRate.toFixed(1)}%
            </div>
            <div>
              <strong>Total Runs:</strong><br />
              {performance.totalRuns}
            </div>
            <div>
              <strong>Avg Response Time:</strong><br />
              {performance.averageResponseTime.toFixed(1)}s
            </div>
          </div>
        </div>
      )}

      {/* Recent Runs */}
      {recentRuns && (
        <div>
          <h3>Recent Runs</h3>
          <div>
            {recentRuns.data.runs.map((run) => (
              <div key={run.runId} style={{ border: '1px solid #eee', padding: '10px', margin: '5px 0' }}>
                <p><strong>Run ID:</strong> {run.runId}</p>
                <p><strong>Round:</strong> {run.roundId}</p>
                <p><strong>Score:</strong> {run.score.toFixed(2)}</p>
                <p><strong>Status:</strong> {run.status}</p>
                <p><strong>Duration:</strong> {run.duration}s</p>
                <p><strong>Tasks:</strong> {run.completedTasks}/{run.totalTasks}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Example 3: Agent Performance Chart Component
export function AgentPerformanceChartExample({ agentId }: { agentId: string }) {
  const { data: performance, loading } = useAgentPerformance(agentId, {
    timeRange: '30d',
    granularity: 'day'
  });

  if (loading) return <div>Loading performance data...</div>;
  if (!performance) return <div>No performance data available</div>;

  return (
    <div>
      <h3>Performance Trend (Last 30 Days)</h3>
      <div style={{ height: '300px', border: '1px solid #ccc', padding: '10px' }}>
        {/* Here you would integrate with a charting library like Chart.js or Recharts */}
        <p>Chart would be rendered here with data:</p>
        <pre>{JSON.stringify(performance.performanceTrend, null, 2)}</pre>
      </div>
    </div>
  );
}

// Example 4: Agent Statistics Dashboard
export function AgentStatisticsExample() {
  const { data: statistics, loading, error } = useAgentStatistics();
  const { data: topAgents } = useTopAgents(5);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!statistics) return <div>No statistics available</div>;

  return (
    <div>
      <h2>Agent Statistics</h2>

      {/* Overall Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #ccc', padding: '15px', textAlign: 'center' }}>
          <h3>{statistics.totalAgents}</h3>
          <p>Total Agents</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', textAlign: 'center' }}>
          <h3>{statistics.activeAgents}</h3>
          <p>Active Agents</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', textAlign: 'center' }}>
          <h3>{statistics.averageSuccessRate.toFixed(1)}%</h3>
          <p>Avg Success Rate</p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', textAlign: 'center' }}>
          <h3>{statistics.averageScore.toFixed(2)}</h3>
          <p>Avg Score</p>
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <h3>Top Performing Agents</h3>
        <div>
          {topAgents?.map((agent, index) => (
            <div key={agent.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid #eee' }}>
              <span>#{index + 1} {agent.name}</span>
              <span>Score: {agent.averageScore.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Distribution */}
      <div style={{ marginTop: '20px' }}>
        <h3>Performance Distribution</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: `${statistics.performanceDistribution.excellent}px`, backgroundColor: '#4CAF50' }}></div>
            <p>Excellent ({statistics.performanceDistribution.excellent}%)</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: `${statistics.performanceDistribution.good}px`, backgroundColor: '#8BC34A' }}></div>
            <p>Good ({statistics.performanceDistribution.good}%)</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: `${statistics.performanceDistribution.average}px`, backgroundColor: '#FFC107' }}></div>
            <p>Average ({statistics.performanceDistribution.average}%)</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: `${statistics.performanceDistribution.poor}px`, backgroundColor: '#F44336' }}></div>
            <p>Poor ({statistics.performanceDistribution.poor}%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example 5: Real-time Agent Monitor
export function RealTimeAgentMonitorExample({ agentId }: { agentId: string }) {
  const { data, loading, error } = useAgentRealtime(agentId, 10000); // Update every 10 seconds

  if (loading) return <div>Loading real-time data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <h2>Real-time Agent Monitor: {data.agent?.name}</h2>

      {/* Current Status */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Current Status</h3>
        <p><strong>Status:</strong> {data.agent?.status}</p>
        <p><strong>Last Seen:</strong> {data.agent?.lastSeen ? new Date(data.agent.lastSeen).toLocaleString() : 'Unknown'}</p>
        <p><strong>Total Runs:</strong> {data.agent?.totalRuns}</p>
        <p><strong>Success Rate:</strong> {data.agent?.successRate.toFixed(1)}%</p>
      </div>

      {/* Recent Activity */}
      <div>
        <h3>Recent Activity</h3>
        <div>
          {data.activity.slice(0, 5).map((activity) => (
            <div key={activity.id} style={{ border: '1px solid #eee', padding: '10px', margin: '5px 0' }}>
              <p><strong>{activity.type.replace('_', ' ').toUpperCase()}</strong></p>
              <p>{activity.message}</p>
              <p><small>{new Date(activity.timestamp).toLocaleString()}</small></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Example 6: Agent Comparison Component
export function AgentComparisonExample() {
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const { data: agents } = useAgents({ limit: 100 });
  const { data: comparison, loading } = useAgentComparison({
    agentIds: selectedAgents,
    timeRange,
  });

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <div>
      <h2>Agent Comparison</h2>

      {/* Agent Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Select Agents to Compare</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {agents?.data.agents.map((agent) => (
            <label key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="checkbox"
                checked={selectedAgents.includes(agent.id)}
                onChange={() => handleAgentToggle(agent.id)}
              />
              {agent.name}
            </label>
          ))}
        </div>
      </div>

      {/* Time Range Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Time Range:
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </label>
      </div>

      {/* Comparison Results */}
      {loading && <div>Loading comparison...</div>}
      {comparison && (
        <div>
          <h3>Comparison Results</h3>

          {/* Comparison Metrics */}
          <div style={{ marginBottom: '20px' }}>
            <h4>Best Performers</h4>
            <p><strong>Best Overall:</strong> {comparison.comparisonMetrics.bestPerformer}</p>
            <p><strong>Most Reliable:</strong> {comparison.comparisonMetrics.mostReliable}</p>
            <p><strong>Fastest:</strong> {comparison.comparisonMetrics.fastest}</p>
            <p><strong>Most Active:</strong> {comparison.comparisonMetrics.mostActive}</p>
          </div>

          {/* Agent Metrics Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>Agent</th>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>Avg Score</th>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>Success Rate</th>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>Avg Duration</th>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>Total Runs</th>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>Ranking</th>
              </tr>
            </thead>
            <tbody>
              {comparison.agents.map((agent) => (
                <tr key={agent.agentId}>
                  <td style={{ border: '1px solid #ccc', padding: '10px' }}>{agent.name}</td>
                  <td style={{ border: '1px solid #ccc', padding: '10px' }}>{agent.metrics.averageScore.toFixed(2)}</td>
                  <td style={{ border: '1px solid #ccc', padding: '10px' }}>{agent.metrics.successRate.toFixed(1)}%</td>
                  <td style={{ border: '1px solid #ccc', padding: '10px' }}>{agent.metrics.averageResponseTime.toFixed(1)}s</td>
                  <td style={{ border: '1px solid #ccc', padding: '10px' }}>{agent.metrics.totalRuns}</td>
                  <td style={{ border: '1px solid #ccc', padding: '10px' }}>#{agent.metrics.ranking}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Example 7: Direct API Service Usage
export function DirectApiUsageExample() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAgents = async () => {
    setLoading(true);
    try {
      const agents = await agentsRepository.getAgents({ limit: 5 });
      setResult(agents);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGetTopAgents = async () => {
    setLoading(true);
    try {
      const topAgents = await agentsRepository.getTopAgents(3);
      setResult(topAgents);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGetStatistics = async () => {
    setLoading(true);
    try {
      const stats = await agentsRepository.getAgentStatistics();
      setResult(stats);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Direct API Service Usage</h2>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleGetAgents} disabled={loading}>
          Get Agents
        </button>
        <button onClick={handleGetTopAgents} disabled={loading}>
          Get Top Agents
        </button>
        <button onClick={handleGetStatistics} disabled={loading}>
          Get Statistics
        </button>
      </div>

      {loading && <div>Loading...</div>}

      {result && (
        <div>
          <h3>Result:</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Main Example Component
export function AgentsApiExamples() {
  const [selectedExample, setSelectedExample] = useState('list');

  const examples = {
    list: AgentsListExample,
    details: () => <AgentDetailsExample agentId="autoppia-bittensor" />,
    performance: () => <AgentPerformanceChartExample agentId="autoppia-bittensor" />,
    statistics: AgentStatisticsExample,
    realtime: () => <RealTimeAgentMonitorExample agentId="autoppia-bittensor" />,
    comparison: AgentComparisonExample,
    direct: DirectApiUsageExample,
  };

  const ExampleComponent = examples[selectedExample as keyof typeof examples];

  return (
    <div>
      <h1>Agents API Examples</h1>

      {/* Example Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Select Example:
          <select value={selectedExample} onChange={(e) => setSelectedExample(e.target.value)}>
            <option value="list">Agents List</option>
            <option value="details">Agent Details</option>
            <option value="performance">Performance Chart</option>
            <option value="statistics">Statistics Dashboard</option>
            <option value="realtime">Real-time Monitor</option>
            <option value="comparison">Agent Comparison</option>
            <option value="direct">Direct API Usage</option>
          </select>
        </label>
      </div>

      {/* Selected Example */}
      <div style={{ border: '1px solid #ccc', padding: '20px' }}>
        <ExampleComponent />
      </div>
    </div>
  );
}
