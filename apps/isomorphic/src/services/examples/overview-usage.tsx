// @ts-nocheck
/**
 * Example usage of the Overview API Service
 * This file demonstrates how to use the new API service in React components
 */

import React from 'react';
import { useOverviewData, useOverviewMetrics, useValidators } from '../hooks/useOverview';
import type { ValidatorData } from '@/repositories/overview/overview.types';

// Example 1: Using the combined hook for overview page
export function OverviewPageExample() {
  const { data, loading, error, refetch } = useOverviewData();

  if (loading) return <div>Loading overview data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Overview Dashboard</h1>

      {/* Metrics */}
      <div>
        <h2>Metrics</h2>
        <p>Top Reward: {data.metrics?.topReward}</p>
        <p>Total Validators: {data.metrics?.totalValidators}</p>
        <p>Total Miners: {data.metrics?.totalMiners}</p>
      </div>

      {/* Current Round */}
      <div>
        <h2>Current Round</h2>
        <p>Round: {data.currentRound?.id}</p>
        <p>Status: {data.currentRound?.status}</p>
        <p>Completed Tasks: {data.currentRound?.completedTasks}/{data.currentRound?.totalTasks}</p>
      </div>

      {/* Validators */}
      <div>
        <h2>Validators</h2>
        {(data.validators?.data?.validators ?? []).map((validator: ValidatorData) => (
          <div key={validator.id}>
            <h3>{validator.name ?? "—"}</h3>
            <p>Status: {validator.status}</p>
            <p>Trust: {validator.trust ?? "—"}</p>
            <p>Weight: {validator.weight ?? "—"}</p>
          </div>
        ))}
      </div>

      {/* Network Status */}
      <div>
        <h2>Network Status</h2>
        <p>Status: {data.networkStatus?.status}</p>
        <p>Active Validators: {data.networkStatus?.activeValidators}</p>
        <p>Latency: {data.networkStatus?.networkLatency}ms</p>
      </div>

      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
}

// Example 2: Using individual hooks for specific data
export function MetricsExample() {
  const { data: metrics, loading, error } = useOverviewMetrics();

  if (loading) return <div>Loading metrics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Overview Metrics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded">
          <h3>Top Reward</h3>
          <p className="text-2xl font-bold">{metrics?.topReward}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h3>Total Validators</h3>
          <p className="text-2xl font-bold">{metrics?.totalValidators}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded">
          <h3>Total Miners</h3>
          <p className="text-2xl font-bold">{metrics?.totalMiners}</p>
        </div>
        <div className="bg-orange-100 p-4 rounded">
          <h3>Total Websites</h3>
          <p className="text-2xl font-bold">{metrics?.totalWebsites}</p>
        </div>
      </div>
    </div>
  );
}

// Example 3: Using validators with filtering
export function ValidatorsExample() {
  const { data: validators, loading, error } = useValidators({
    limit: 5,
    sortBy: 'weight',
    sortOrder: 'desc'
  });

  if (loading) return <div>Loading validators...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Top Validators by Weight</h2>
      <div className="space-y-4">
        {(validators?.data?.validators ?? []).map((validator: ValidatorData) => (
          <div key={validator.id} className="border p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{validator.name ?? "—"}</h3>
                <p className="text-sm text-gray-600">Status: {validator.status}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  Weight:{" "}
                  {typeof validator.weight === "number"
                    ? validator.weight.toLocaleString()
                    : "—"}
                </p>
                <p className="text-sm">Trust: {validator.trust ?? "—"}</p>
              </div>
            </div>
            <p className="text-sm mt-2 text-gray-700">
              Current Task: {validator.currentTask.substring(0, 100)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 4: Error handling and retry logic
export function ErrorHandlingExample() {
  const { data, loading, error, refetch } = useOverviewMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading...</span>
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
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
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
      <h2>Overview Metrics</h2>
      <p>Top Reward: {data?.topReward}</p>
      <p>Total Validators: {data?.totalValidators}</p>
    </div>
  );
}
