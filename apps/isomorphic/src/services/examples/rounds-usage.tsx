// @ts-nocheck
/**
 * Example usage of the Rounds API Service
 * This file demonstrates how to use the new rounds API service in React components
 */

import React from 'react';
import { useRoundData, useRoundsList, useRoundStatistics, useRoundMiners } from '../hooks/useRounds';

// Example 1: Using the combined hook for round page
export function RoundPageExample({ roundId }: { roundId: number }) {
  const { data, loading, error, refetch } = useRoundData(roundId);

  if (loading) return <div>Loading round data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Round {roundId} Dashboard</h1>

      {/* Round Info */}
      <div>
        <h2>Round Information</h2>
        <p>Status: {data.round?.status}</p>
        <p>Progress: {data.progress?.progress}%</p>
        <p>Current Block: {data.progress?.currentBlock}</p>
        <p>Blocks Remaining: {data.progress?.blocksRemaining}</p>
      </div>

      {/* Statistics */}
      <div>
        <h2>Statistics</h2>
        <p>Total Miners: {data.statistics?.totalMiners}</p>
        <p>Active Miners: {data.statistics?.activeMiners}</p>
        <p>Average Score: {data.statistics?.averageScore}</p>
        <p>Top Score: {data.statistics?.topScore}</p>
        <p>Success Rate: {data.statistics?.successRate}%</p>
      </div>

      {/* Top Miners */}
      <div>
        <h2>Top Miners</h2>
        {data.topMiners?.map((miner) => (
          <div key={miner.uid}>
            <h3>Miner {miner.uid}</h3>
            <p>Score: {miner.score}</p>
            <p>Ranking: {miner.ranking}</p>
            <p>Duration: {miner.duration}s</p>
          </div>
        ))}
      </div>

      {/* Validators */}
      <div>
        <h2>Validators</h2>
        {data.validators?.map((validator) => (
          <div key={validator.id}>
            <h3>{validator.name ?? "—"}</h3>
            <p>Status: {validator.status}</p>
            <p>Trust: {validator.trust ?? "—"}</p>
            <p>Weight: {validator.weight ?? "—"}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h2>Recent Activity</h2>
        {data.activity?.map((activity) => (
          <div key={activity.id}>
            <p>{activity.message}</p>
            <p>Time: {activity.timestamp}</p>
          </div>
        ))}
      </div>

      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
}

// Example 2: Using individual hooks for specific data
export function RoundStatisticsExample({ roundId }: { roundId: number }) {
  const { data: statistics, loading, error } = useRoundStatistics(roundId);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Round {roundId} Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded">
          <h3>Total Miners</h3>
          <p className="text-2xl font-bold">{statistics?.totalMiners}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h3>Active Miners</h3>
          <p className="text-2xl font-bold">{statistics?.activeMiners}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <h3>Average Score</h3>
          <p className="text-2xl font-bold">{statistics?.averageScore}</p>
        </div>
        <div className="bg-orange-100 p-4 rounded">
          <h3>Top Score</h3>
          <p className="text-2xl font-bold">{statistics?.topScore}</p>
        </div>
      </div>
    </div>
  );
}

// Example 3: Using rounds list
export function RoundsListExample() {
  const { data, loading, error } = useRoundsList();

  if (loading) return <div>Loading rounds...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Rounds List</h2>
      <div className="space-y-4">
        {data.rounds?.data.rounds.map((round) => (
          <div key={round.id} className="border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Round {round.id}</h3>
                <p className="text-sm text-gray-600">
                  Status: {round.status} | Progress: {round.progress}%
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">Score: {round.averageScore}</p>
                <p className="text-sm">Tasks: {round.completedTasks}/{round.totalTasks}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.currentRound && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">Current Round</h3>
          <p>Round {data.currentRound.id} - {data.currentRound.status}</p>
        </div>
      )}
    </div>
  );
}

// Example 4: Using round miners with filtering
export function RoundMinersExample({ roundId }: { roundId: number }) {
  const { data: miners, loading, error } = useRoundMiners(roundId, {
    limit: 10,
    sortBy: 'score',
    sortOrder: 'desc'
  });

  if (loading) return <div>Loading miners...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Top Miners - Round {roundId}</h2>
      <div className="space-y-4">
        {miners?.data.miners.map((miner) => (
          <div key={miner.uid} className="border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Miner {miner.uid}</h3>
                <p className="text-sm text-gray-600">
                  Hotkey: {miner.hotkey.slice(0, 8)}...{miner.hotkey.slice(-8)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">Score: {miner.score}</p>
                <p className="text-sm">Rank: #{miner.ranking}</p>
                <p className="text-sm">Duration: {miner.duration}s</p>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-4 text-sm">
                <span className={miner.success ? 'text-green-600' : 'text-red-600'}>
                  {miner.success ? '✅ Success' : '❌ Failed'}
                </span>
                <span>Tasks: {miner.tasksCompleted}/{miner.tasksTotal}</span>
                <span>Stake: {miner.stake.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 5: Error handling and retry logic
export function RoundErrorHandlingExample({ roundId }: { roundId: number }) {
  const { data, loading, error, refetch } = useRoundStatistics(roundId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading round statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading round statistics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={refetch}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Round {roundId} Statistics</h2>
      <p>Total Miners: {data?.totalMiners}</p>
      <p>Average Score: {data?.averageScore}</p>
    </div>
  );
}
