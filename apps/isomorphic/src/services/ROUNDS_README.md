# Rounds API Service

This document provides comprehensive information about the Rounds API service for the AutoPPIA Bittensor Dashboard.

## Overview

The Rounds API service provides a complete interface for managing and displaying round-related data in the dashboard. It includes endpoints for round information, statistics, miner performance, validator data, activity feeds, and progress tracking.

## File Structure

```
src/services/
├── api/
│   ├── types/rounds.ts          # TypeScript interfaces for rounds data
│   ├── rounds.service.ts        # Main rounds API service
│   └── index.ts                 # Service exports
├── hooks/
│   └── useRounds.ts             # React hooks for rounds API
└── examples/
    └── rounds-usage.tsx         # Usage examples
```

## API Endpoints

### Base URL
```
http://localhost:8000/api/v1/rounds
```

### Available Endpoints

1. **GET `/rounds`** - List all rounds with pagination
2. **GET `/rounds/{id}`** - Get specific round details
3. **GET `/rounds/current`** - Get current active round
4. **GET `/rounds/{id}/statistics`** - Get round statistics
5. **GET `/rounds/{id}/miners`** - Get round miners with filtering
6. **GET `/rounds/{id}/miners/top`** - Get top performing miners
7. **GET `/rounds/{id}/miners/{uid}`** - Get specific miner performance
8. **GET `/rounds/{id}/validators`** - Get round validators
9. **GET `/rounds/{id}/validators/{id}`** - Get specific validator performance
10. **GET `/rounds/{id}/activity`** - Get round activity feed
11. **GET `/rounds/{id}/progress`** - Get round progress information
12. **GET `/rounds/{id}/summary`** - Get round summary
13. **POST `/rounds/compare`** - Compare multiple rounds
14. **GET `/rounds/{id}/timeline`** - Get round timeline data

## TypeScript Types

### Core Data Types

```typescript
interface RoundData {
  id: number;
  startBlock: number;
  endBlock: number;
  current: boolean;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'pending';
  totalTasks: number;
  completedTasks: number;
  averageScore: number;
  topScore: number;
  currentBlock?: number;
  blocksRemaining?: number;
  progress?: number;
}

interface RoundStatistics {
  roundId: number;
  totalMiners: number;
  activeMiners: number;
  totalTasks: number;
  completedTasks: number;
  averageScore: number;
  topScore: number;
  successRate: number;
  averageDuration: number;
  totalStake: number;
  totalEmission: number;
  lastUpdated: string;
}

interface MinerPerformance {
  uid: number;
  hotkey: string;
  success: boolean;
  score: number;
  duration: number;
  ranking: number;
  tasksCompleted: number;
  tasksTotal: number;
  stake: number;
  emission: number;
  lastSeen: string;
  validatorId?: string;
}

interface ValidatorPerformance {
  id: string;
  name: string;
  hotkey: string;
  icon: string;
  status: 'active' | 'inactive' | 'offline';
  totalTasks: number;
  completedTasks: number;
  averageScore: number;
  weight: number;
  trust: number;
  version: number;
  stake: number;
  emission: number;
  lastSeen: string;
  uptime: number;
}
```

## React Hooks

### Individual Hooks

```typescript
// Get rounds list
const { data, loading, error } = useRounds(params);

// Get specific round
const { data, loading, error } = useRound(roundId);

// Get current round
const { data, loading, error } = useCurrentRound();

// Get round statistics
const { data, loading, error } = useRoundStatistics(roundId);

// Get round miners
const { data, loading, error } = useRoundMiners(roundId, params);

// Get round validators
const { data, loading, error } = useRoundValidators(roundId);

// Get round activity
const { data, loading, error } = useRoundActivity(roundId, params);

// Get round progress
const { data, loading, error } = useRoundProgress(roundId);

// Get top miners
const { data, loading, error } = useTopMiners(roundId, limit);

// Get specific miner performance
const { data, loading, error } = useMinerPerformance(roundId, minerUid);

// Get specific validator performance
const { data, loading, error } = useValidatorPerformance(roundId, validatorId);

// Get round summary
const { data, loading, error } = useRoundSummary(roundId);
```

### Combined Hooks

```typescript
// Get all round data for a page
const { data, loading, error, refetch } = useRoundData(roundId);

// Get rounds list with current round
const { data, loading, error, refetch } = useRoundsList();
```

## Usage Examples

### Basic Round Page

```typescript
import { useRoundData } from '@/services/hooks/useRounds';

function RoundPage({ roundId }: { roundId: number }) {
  const { data, loading, error, refetch } = useRoundData(roundId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Round {roundId}</h1>
      <p>Status: {data.round?.status}</p>
      <p>Progress: {data.progress?.progress}%</p>
      <p>Total Miners: {data.statistics?.totalMiners}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Rounds List

```typescript
import { useRoundsList } from '@/services/hooks/useRounds';

function RoundsList() {
  const { data, loading, error } = useRoundsList();

  if (loading) return <div>Loading rounds...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Current Round: {data.currentRound?.id}</h2>
      {data.rounds?.data.rounds.map(round => (
        <div key={round.id}>
          Round {round.id} - {round.status}
        </div>
      ))}
    </div>
  );
}
```

### Round Statistics

```typescript
import { useRoundStatistics } from '@/services/hooks/useRounds';

function RoundStats({ roundId }: { roundId: number }) {
  const { data, loading, error } = useRoundStatistics(roundId);

  if (loading) return <div>Loading statistics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3>Total Miners</h3>
        <p>{data?.totalMiners}</p>
      </div>
      <div>
        <h3>Average Score</h3>
        <p>{data?.averageScore}</p>
      </div>
    </div>
  );
}
```

## Error Handling

All hooks return consistent error handling:

```typescript
const { data, loading, error, refetch } = useRound(roundId);

// Loading state
if (loading) return <LoadingSpinner />;

// Error state
if (error) return <ErrorMessage message={error} onRetry={refetch} />;

// Success state
return <RoundData data={data} />;
```

## Query Parameters

### Rounds List Parameters
```typescript
interface RoundsListQueryParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'pending';
  sortBy?: 'id' | 'startTime' | 'endTime' | 'totalTasks' | 'averageScore';
  sortOrder?: 'asc' | 'desc';
}
```

### Round Miners Parameters
```typescript
interface RoundMinersQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'score' | 'duration' | 'ranking' | 'uid';
  sortOrder?: 'asc' | 'desc';
  success?: boolean;
  minScore?: number;
  maxScore?: number;
}
```

### Round Activity Parameters
```typescript
interface RoundActivityQueryParams {
  limit?: number;
  offset?: number;
  type?: string;
  since?: string;
}
```

## Environment Configuration

Set the API base URL in your environment:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Testing

Use the test page to verify API integration:

```
http://localhost:3000/rounds-api-test
```

This page provides:
- Rounds list testing
- Round statistics display
- Miners performance data
- Combined round data
- Error handling examples

## Best Practices

1. **Use Combined Hooks**: For pages that need multiple data sources, use `useRoundData` instead of multiple individual hooks.

2. **Error Handling**: Always handle loading and error states in your components.

3. **Refetch on Demand**: Use the `refetch` function for manual data refresh.

4. **Query Parameters**: Use appropriate query parameters for filtering and pagination.

5. **Type Safety**: Leverage TypeScript types for better development experience.

6. **Performance**: Use pagination and filtering to avoid loading large datasets.

## Integration with Components

The rounds service is designed to work seamlessly with existing dashboard components:

- **Round Progress**: Use `useRoundProgress` for real-time progress updates
- **Round Statistics**: Use `useRoundStatistics` for metrics display
- **Miner Performance**: Use `useRoundMiners` for miner leaderboards
- **Validator Data**: Use `useRoundValidators` for validator information
- **Activity Feed**: Use `useRoundActivity` for recent activity display

## Future Enhancements

Potential future improvements:

1. **Real-time Updates**: WebSocket integration for live data
2. **Caching**: Implement data caching for better performance
3. **Optimistic Updates**: Update UI before API confirmation
4. **Infinite Scroll**: For large datasets
5. **Data Export**: Export functionality for round data
6. **Notifications**: Real-time notifications for round events

## Support

For issues or questions about the rounds API service:

1. Check the test page: `/rounds-api-test`
2. Review the API specifications: `ROUNDS_API_SPECIFICATIONS.md`
3. Check the usage examples: `src/services/examples/rounds-usage.tsx`
4. Verify environment configuration
5. Check browser console for API errors
