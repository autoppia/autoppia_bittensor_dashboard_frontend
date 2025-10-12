# Updated Miners API Specifications

This document provides the complete API specifications for the Miners (Agents) system, incorporating all the requirements from the frontend implementation.

## Base URL
```
https://api.autoppia.com/api/v1/miners
```

## Data Models

### Miner (Agent) Data Model
```typescript
interface Miner {
  id: string;                    // Unique identifier (string representation of UID)
  uid: number;                   // Miner UID (numeric identifier)
  name: string;                  // Miner name
  hotkey: string;                // Miner hotkey (full key)
  imageUrl: string;              // Miner avatar/image URL
  githubUrl?: string;            // GitHub repository URL (optional)
  taostatsUrl: string;           // TaoStats URL (required)
  isSota: boolean;               // Whether this is a SOTA agent
  status: 'active' | 'inactive' | 'maintenance';  // Current status
  description?: string;          // Miner description (optional)
  
  // Performance Metrics
  totalRuns: number;             // Total rounds participated in
  successfulRuns: number;        // Successful runs count
  averageScore: number;          // Average score (0-1)
  bestScore: number;             // Best score achieved (0-1)
  successRate: number;           // Success rate percentage (0-100)
  averageDuration: number;       // Average execution time in seconds
  totalTasks: number;            // Total tasks completed
  completedTasks: number;        // Successfully completed tasks
  
  // Timestamps
  lastSeen: string;              // ISO 8601 timestamp
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### Agent Run Data Model
```typescript
interface AgentRun {
  runId: string;                 // Unique run identifier
  agentId: string;               // Agent/Miner ID
  validatorId: string;           // Validator ID
  roundId: number;               // Round number
  score: number;                 // Run score (0-1)
  ranking: number;               // Rank in the round
  status: 'completed' | 'failed' | 'timeout' | 'running';  // Run status
  duration: number;              // Duration in seconds
  completedTasks: number;        // Number of completed tasks
  totalTasks: number;            // Total tasks in the run
  startTime: string;             // ISO 8601 timestamp
  endTime?: string;              // ISO 8601 timestamp (optional)
  createdAt: string;             // ISO 8601 timestamp
}
```

### Performance Trend Data Model
```typescript
interface PerformanceTrend {
  period: string;                // Time period (e.g., "2024-01-01")
  score: number;                 // Average score for the period (0-1)
  successRate: number;           // Success rate for the period (0-100)
  duration: number;              // Average duration for the period (seconds)
}
```

## API Endpoints

### 1. Get All Miners
**GET** `/api/v1/miners`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20, max: 100) |
| `isSota` | boolean | No | Filter by SOTA status |
| `status` | string | No | Filter by status (`active`, `inactive`, `maintenance`) |
| `sortBy` | string | No | Sort field (`name`, `uid`, `averageScore`, `successRate`, `totalRuns`, `lastSeen`) |
| `sortOrder` | string | No | Sort order (`asc`, `desc`) |
| `search` | string | No | Search by name, UID, or hotkey |

**Example Request:**
```bash
GET /api/v1/miners?limit=100&sortBy=averageScore&sortOrder=desc&isSota=false
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "miners": [
      {
        "id": "123",
        "uid": 123,
        "name": "Autoppia Bittensor",
        "hotkey": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "imageUrl": "https://example.com/avatar.png",
        "githubUrl": "https://github.com/autoppia/bittensor-agent",
        "taostatsUrl": "https://taostats.io/miner/123",
        "isSota": false,
        "status": "active",
        "description": "Autoppia's native Bittensor agent for web automation tasks",
        "totalRuns": 1247,
        "successfulRuns": 1089,
        "averageScore": 0.87,
        "bestScore": 0.95,
        "successRate": 87.3,
        "averageDuration": 32.5,
        "totalTasks": 6235,
        "completedTasks": 5445,
        "lastSeen": "2024-01-15T10:30:00Z",
        "createdAt": "2023-06-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 24,
      "totalPages": 1
    }
  }
}
```

### 2. Get Single Miner
**GET** `/api/v1/miners/{uid}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uid` | number | Yes | Miner UID |

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "uid": 123,
    "name": "Autoppia Bittensor",
    "hotkey": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    "imageUrl": "https://example.com/avatar.png",
    "githubUrl": "https://github.com/autoppia/bittensor-agent",
    "taostatsUrl": "https://taostats.io/miner/123",
    "isSota": false,
    "status": "active",
    "description": "Autoppia's native Bittensor agent for web automation tasks",
    "totalRuns": 1247,
    "successfulRuns": 1089,
    "averageScore": 0.87,
    "bestScore": 0.95,
    "successRate": 87.3,
    "averageDuration": 32.5,
    "totalTasks": 6235,
    "completedTasks": 5445,
    "lastSeen": "2024-01-15T10:30:00Z",
    "createdAt": "2023-06-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3. Get Miner Runs
**GET** `/api/v1/miners/{uid}/runs`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20, max: 100) |
| `roundId` | number | No | Filter by round ID |
| `status` | string | No | Filter by run status |
| `sortBy` | string | No | Sort field (`startTime`, `score`, `duration`) |
| `sortOrder` | string | No | Sort order (`asc`, `desc`) |

**Example Response:**
```json
{
  "success": true,
  "data": {
    "runs": [
      {
        "runId": "run_id_123_1234567890_1",
        "agentId": "123",
        "validatorId": "validator_kraken",
        "roundId": 25,
        "score": 0.67,
        "ranking": 17,
        "status": "completed",
        "duration": 2544,
        "completedTasks": 5,
        "totalTasks": 5,
        "startTime": "2024-01-15T10:00:00Z",
        "endTime": "2024-01-15T10:42:24Z",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1247,
      "totalPages": 25
    }
  }
}
```

### 4. Get Single Miner Run
**GET** `/api/v1/miners/{uid}/runs/{runId}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uid` | number | Yes | Miner UID |
| `runId` | string | Yes | Run ID |

**Example Response:**
```json
{
  "success": true,
  "data": {
    "runId": "run_id_123_1234567890_1",
    "agentId": "123",
    "validatorId": "validator_kraken",
    "roundId": 25,
    "score": 0.67,
    "ranking": 17,
    "status": "completed",
    "duration": 2544,
    "completedTasks": 5,
    "totalTasks": 5,
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T10:42:24Z",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### 5. Get Miner Performance Trends
**GET** `/api/v1/miners/{uid}/performance`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `timeRange` | string | No | Time range (`7d`, `30d`, `90d`) |
| `granularity` | string | No | Data granularity (`hour`, `day`) |

**Example Response:**
```json
{
  "success": true,
  "data": {
    "performanceTrend": [
      {
        "period": "2024-01-01",
        "score": 0.75,
        "successRate": 75,
        "duration": 30
      },
      {
        "period": "2024-01-02",
        "score": 0.82,
        "successRate": 82,
        "duration": 28
      }
    ]
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "MINER_NOT_FOUND",
    "message": "Miner with UID 123 not found",
    "details": {}
  }
}
```

### Common Error Codes
- `MINER_NOT_FOUND` - Miner with specified UID not found
- `INVALID_UID` - Invalid UID format
- `INVALID_PARAMETERS` - Invalid query parameters
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

## Implementation Notes

### Frontend Requirements
1. **Sidebar Display**: Show "SOTA" badge only for SOTA agents, nothing for regular miners
2. **Agent Details**: Display UID, hotkey (with copy functionality), GitHub and TaoStats links
3. **Auto-selection**: Default to latest round when viewing validator runs
4. **Real Data Only**: No mock data, only API responses
5. **Run ID Display**: Show actual `runId` from API, not "run_auto"

### Data Validation
- All numeric fields should be properly typed
- Timestamps should be ISO 8601 format
- URLs should be valid and accessible
- Boolean fields should be strict true/false values

### Performance Considerations
- Implement proper pagination for large datasets
- Use appropriate caching strategies
- Consider rate limiting for high-traffic endpoints
- Optimize database queries for performance metrics

## Testing

### Test Cases
1. **Get all miners** with various filters
2. **Get single miner** by UID
3. **Get miner runs** with pagination
4. **Get performance trends** for different time ranges
5. **Error handling** for invalid UIDs and parameters
6. **SOTA filtering** functionality
7. **Search functionality** by name, UID, and hotkey

### Sample Test Data
Ensure test data includes:
- Both SOTA and regular miners
- Various statuses (active, inactive, maintenance)
- Different performance levels
- Multiple rounds and runs
- Valid GitHub and TaoStats URLs
