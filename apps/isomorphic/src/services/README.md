# API Services

This directory contains the API services and related utilities for the AutoPPIA Bittensor Dashboard frontend.

## Structure

```
services/
├── api/
│   ├── client.ts              # Base API client with error handling
│   ├── overview.service.ts    # Overview section API service
│   ├── types/
│   │   └── overview.ts        # TypeScript interfaces for overview API
│   └── index.ts               # Central export point
├── hooks/
│   └── useOverview.ts         # React hooks for overview API
├── examples/
│   └── overview-usage.tsx     # Usage examples
└── README.md                  # This file
```

## Usage

### Basic API Client

```typescript
import { apiClient } from '@/services/api';

// Make a GET request
const response = await apiClient.get('/api/v1/overview/metrics');

// Make a POST request
const response = await apiClient.post('/api/v1/overview/validators', {
  name: 'New Validator',
  hotkey: '5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe'
});
```

### Overview Service

```typescript
import { overviewService } from '@/services/api';

// Get overview metrics
const metrics = await overviewService.getMetrics();

// Get validators with filtering
const validators = await overviewService.getValidators({
  limit: 10,
  sortBy: 'weight',
  sortOrder: 'desc'
});

// Get current round
const currentRound = await overviewService.getCurrentRound();
```

### React Hooks

```typescript
import { useOverviewData, useOverviewMetrics } from '@/services/hooks/useOverview';

function OverviewComponent() {
  const { data, loading, error, refetch } = useOverviewData();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Overview Dashboard</h1>
      <p>Top Score: {data.metrics?.topScore}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## Configuration

Set the API base URL using environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Error Handling

The API client automatically handles HTTP errors and returns structured error responses:

```typescript
try {
  const data = await overviewService.getMetrics();
  // Handle success
} catch (error) {
  console.error('API Error:', error.message);
  console.error('Status:', error.status);
  console.error('Code:', error.code);
}
```

## TypeScript Support

All API responses are fully typed. Import types as needed:

```typescript
import type {
  OverviewMetrics,
  ValidatorData,
  RoundData,
  LeaderboardData
} from '@/services/api';
```

## Adding New Services

To add a new API service:

1. Create a new service file in `api/` directory
2. Define TypeScript interfaces in `api/types/`
3. Create React hooks in `hooks/`
4. Export from `api/index.ts`
5. Update this README

## Examples

See `examples/overview-usage.tsx` for comprehensive usage examples including:
- Using combined hooks
- Individual data fetching
- Error handling
- Loading states
- Retry logic

## API Specifications

For detailed API endpoint specifications, see the main `API_SPECIFICATIONS.md` file in the project root.
