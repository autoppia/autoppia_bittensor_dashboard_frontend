"use client";

import React, { useState } from 'react';
import { useRoundData, useRoundsList, useRoundStatistics, useRoundMiners } from '@/services/hooks/useRounds';

export default function RoundsApiTestPage() {
  const [selectedRoundId, setSelectedRoundId] = useState(20);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Rounds API Test Page</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rounds List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Rounds List</h2>
          <RoundsListTest />
        </div>

        {/* Round Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Round Statistics</h2>
          <RoundStatisticsTest roundId={selectedRoundId} />
        </div>

        {/* Round Miners */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Round Miners</h2>
          <RoundMinersTest roundId={selectedRoundId} />
        </div>

        {/* Round Data (Combined) */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Combined Round Data</h2>
          <RoundDataTest roundId={selectedRoundId} />
        </div>
      </div>

      {/* Round Selection */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Test Different Rounds</h2>
        <div className="flex gap-4">
          {[18, 19, 20].map((roundId) => (
            <button
              key={roundId}
              onClick={() => setSelectedRoundId(roundId)}
              className={`px-4 py-2 rounded ${
                selectedRoundId === roundId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Round {roundId}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Currently testing: Round {selectedRoundId}
        </p>
      </div>
    </div>
  );
}

function RoundsListTest() {
  const { data, loading, error } = useRoundsList();

  if (loading) return <div className="text-blue-600">Loading rounds list...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-medium">Current Round:</h3>
        {data?.currentRound ? (
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p><strong>Round {data.currentRound.id}</strong></p>
            <p>Status: {data.currentRound.status}</p>
            <p>Progress: {data.currentRound.progress}%</p>
          </div>
        ) : (
          <p className="text-gray-500">No current round</p>
        )}
      </div>

      <div>
        <h3 className="font-medium">Recent Rounds:</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {data?.rounds?.data.rounds.slice(0, 5).map((round) => (
            <div key={round.roundKey ?? round.id} className="bg-gray-50 p-2 rounded text-sm">
              <div className="flex justify-between">
                <span>Round {round.id}</span>
                <span className={round.current ? 'text-green-600' : 'text-gray-600'}>
                  {round.current ? 'Current' : round.status}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Score: {round.averageScore} | Tasks: {round.completedTasks}/{round.totalTasks}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoundStatisticsTest({ roundId }: { roundId: number }) {
  const { data, loading, error } = useRoundStatistics(roundId);

  if (loading) return <div className="text-blue-600">Loading statistics...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-blue-50 p-3 rounded">
        <h4 className="font-medium text-blue-800">Total Miners</h4>
        <p className="text-2xl font-bold text-blue-600">{data?.totalMiners}</p>
      </div>
      <div className="bg-green-50 p-3 rounded">
        <h4 className="font-medium text-green-800">Active Miners</h4>
        <p className="text-2xl font-bold text-green-600">{data?.activeMiners}</p>
      </div>
      <div className="bg-purple-50 p-3 rounded">
        <h4 className="font-medium text-purple-800">Average Score</h4>
        <p className="text-2xl font-bold text-purple-600">{data?.averageScore}</p>
      </div>
      <div className="bg-orange-50 p-3 rounded">
        <h4 className="font-medium text-orange-800">Top Score</h4>
        <p className="text-2xl font-bold text-orange-600">{data?.topScore}</p>
      </div>
      <div className="bg-red-50 p-3 rounded col-span-2">
        <h4 className="font-medium text-red-800">Success Rate</h4>
        <p className="text-2xl font-bold text-red-600">{((data?.successRate || 0) * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
}

function RoundMinersTest({ roundId }: { roundId: number }) {
  const { data, loading, error } = useRoundMiners(roundId, {
    limit: 5,
    sortBy: 'score',
    sortOrder: 'desc'
  });

  if (loading) return <div className="text-blue-600">Loading miners...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-3">
      {data?.data.miners.map((miner) => (
        <div key={miner.uid} className="bg-gray-50 p-3 rounded">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">Miner {miner.uid}</h4>
              <p className="text-sm text-gray-600">
                {miner.hotkey.slice(0, 8)}...{miner.hotkey.slice(-8)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{miner.score}</p>
              <p className="text-sm text-gray-600">Rank #{miner.ranking}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className={miner.success ? 'text-green-600' : 'text-red-600'}>
              {miner.success ? '✅ Success' : '❌ Failed'}
            </span>
            <span>Duration: {miner.duration}s</span>
            <span>Tasks: {miner.tasksCompleted}/{miner.tasksTotal}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RoundDataTest({ roundId }: { roundId: number }) {
  const { data, loading, error } = useRoundData(roundId);

  if (loading) return <div className="text-blue-600">Loading combined data...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded">
        <h4 className="font-medium text-blue-800">Round Info</h4>
        <p>Status: {data.round?.status}</p>
        <p>Progress: {data.progress?.progress}%</p>
        <p>Current Block: {data.progress?.currentBlock}</p>
      </div>

      <div className="bg-green-50 p-3 rounded">
        <h4 className="font-medium text-green-800">Validators</h4>
        <p>Count: {data.validators?.length || 0}</p>
        {data.validators?.slice(0, 2).map((validator) => (
          <div key={validator.id} className="text-sm">
            {validator.name} - {validator.status}
          </div>
        ))}
      </div>

      <div className="bg-purple-50 p-3 rounded">
        <h4 className="font-medium text-purple-800">Recent Activity</h4>
        <p>Activities: {data.activity?.length || 0}</p>
        {data.activity?.slice(0, 2).map((activity) => (
          <div key={activity.id} className="text-sm">
            {activity.message}
          </div>
        ))}
      </div>
    </div>
  );
}
