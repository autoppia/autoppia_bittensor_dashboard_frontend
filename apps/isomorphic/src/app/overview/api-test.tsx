"use client";

import { useState } from 'react';
import { overviewService } from '@/services/api/overview.service';

export default function ApiTest() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await testFn();
      setTestResults(prev => ({
        ...prev,
        [name]: { success: true, data: result }
      }));
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [name]: { success: false, error: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    
    await testEndpoint('Metrics', () => overviewService.getMetrics());
    await testEndpoint('Validators', () => overviewService.getValidators({ limit: 5 }));
    await testEndpoint('Current Round', () => overviewService.getCurrentRound());
    await testEndpoint('Leaderboard', () => overviewService.getLeaderboard({ timeRange: '7D' }));
    await testEndpoint('Network Status', () => overviewService.getNetworkStatus());
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">API Integration Test</h2>
      
      <div className="mb-4">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test All Endpoints'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(testResults).map(([name, result]) => (
          <div key={name} className="border rounded p-4">
            <h3 className="font-semibold mb-2">{name}</h3>
            {result.success ? (
              <div className="text-green-600">
                ✅ Success
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-red-600">
                ❌ Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}</p>
        <p><strong>Expected Backend:</strong> http://localhost:8000/api/v1/overview/*</p>
      </div>
    </div>
  );
}
