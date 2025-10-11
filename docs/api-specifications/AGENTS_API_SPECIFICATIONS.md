# Agents API Specifications

This document provides comprehensive specifications for the Agents API endpoints that need to be implemented in the backend to support the AutoPPIA Bittensor Dashboard frontend.

## Overview

The Agents API provides endpoints for managing and displaying agent-related data in the dashboard. It includes endpoints for agent information, performance metrics, run history, activity feeds, and comparative analysis.

## Base URL

```
http://localhost:8000/api/v1/agents
```

## Authentication

All endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "data": {
    // Response data here
  },
  "success": true,
  "message": "Optional success message",
  "error": null
}
```

Error responses:

```json
{
  "data": null,
  "success": false,
  "message": null,
  "error": "Error description"
}
```

## Endpoints

### 1. Get All Agents

**GET** `/api/v1/agents`

Retrieves a paginated list of all agents with optional filtering and sorting.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `limit` | integer | No | 20 | Number of items per page |
| `type` | string | No | - | Filter by agent type (`autoppia`, `openai`, `anthropic`, `browser-use`, `custom`) |
| `status` | string | No | - | Filter by status (`active`, `inactive`, `maintenance`) |
| `sortBy` | string | No | `name` | Sort field (`name`, `averageScore`, `successRate`, `totalRuns`, `lastSeen`) |
| `sortOrder` | string | No | `asc` | Sort order (`asc`, `desc`) |
| `search` | string | No | - | Search by agent name or description |

#### Response

```json
{
  "data": {
    "agents": [
      {
        "id": "autoppia-bittensor",
        "name": "Autoppia Bittensor",
        "type": "autoppia",
        "imageUrl": "/icons/bittensor.webp",
        "description": "Autoppia's native Bittensor agent for web automation tasks",
        "version": "7.0.0",
        "status": "active",
        "totalRuns": 1247,
        "successfulRuns": 1089,
        "averageScore": 0.87,
        "bestScore": 0.95,
        "successRate": 87.3,
        "averageDuration": 32.5,
        "totalTasks": 12470,
        "completedTasks": 10890,
        "lastSeen": "2024-01-15T10:00:00Z",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

### 2. Get Agent Details

**GET** `/api/v1/agents/{id}`

Retrieves detailed information for a specific agent.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Agent ID |

#### Response

```json
{
  "data": {
    "agent": {
      "id": "autoppia-bittensor",
      "name": "Autoppia Bittensor",
      "type": "autoppia",
      "imageUrl": "/icons/bittensor.webp",
      "description": "Autoppia's native Bittensor agent for web automation tasks",
      "version": "7.0.0",
      "status": "active",
      "totalRuns": 1247,
      "successfulRuns": 1089,
      "averageScore": 0.87,
      "bestScore": 0.95,
      "successRate": 87.3,
      "averageDuration": 32.5,
      "totalTasks": 12470,
      "completedTasks": 10890,
      "lastSeen": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### 3. Get Agent Performance Metrics

**GET** `/api/v1/agents/{id}/performance`

Retrieves performance metrics for a specific agent over a specified time range.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Agent ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `timeRange` | string | No | `7d` | Time range (`1h`, `24h`, `7d`, `30d`, `90d`, `1y`, `all`) |
| `startDate` | string | No | - | Start date (ISO 8601 format) |
| `endDate` | string | No | - | End date (ISO 8601 format) |
| `granularity` | string | No | `day` | Data granularity (`hour`, `day`, `week`, `month`) |

#### Response

```json
{
  "data": {
    "metrics": {
      "agentId": "autoppia-bittensor",
      "timeRange": {
        "start": "2024-01-08T10:00:00Z",
        "end": "2024-01-15T10:00:00Z"
      },
      "totalRuns": 150,
      "successfulRuns": 131,
      "failedRuns": 19,
      "averageScore": 0.87,
      "bestScore": 0.95,
      "worstScore": 0.12,
      "successRate": 87.3,
      "averageDuration": 32.5,
      "totalTasks": 1500,
      "completedTasks": 1310,
      "taskCompletionRate": 87.3,
      "scoreDistribution": {
        "excellent": 45,
        "good": 60,
        "average": 35,
        "poor": 10
      },
      "performanceTrend": [
        {
          "period": "2024-01-08",
          "score": 0.85,
          "successRate": 85.0,
          "duration": 30.2
        }
      ]
    }
  }
}
```

### 4. Get Agent Runs

**GET** `/api/v1/agents/{id}/runs`

Retrieves a paginated list of runs for a specific agent.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Agent ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `limit` | integer | No | 20 | Items per page |
| `roundId` | integer | No | - | Filter by round ID |
| `validatorId` | string | No | - | Filter by validator ID |
| `status` | string | No | - | Filter by status (`running`, `completed`, `failed`, `timeout`) |
| `sortBy` | string | No | `startTime` | Sort field (`startTime`, `score`, `duration`, `ranking`) |
| `sortOrder` | string | No | `desc` | Sort order (`asc`, `desc`) |
| `startDate` | string | No | - | Filter runs after this date |
| `endDate` | string | No | - | Filter runs before this date |

#### Response

```json
{
  "data": {
    "runs": [
      {
        "runId": "run_autoppia_1234567890_1",
        "agentId": "autoppia-bittensor",
        "roundId": 20,
        "validatorId": "autoppia",
        "startTime": "2024-01-15T10:00:00Z",
        "endTime": "2024-01-15T10:32:00Z",
        "status": "completed",
        "totalTasks": 10,
        "completedTasks": 10,
        "score": 0.87,
        "duration": 1920,
        "ranking": 5,
        "tasks": [
          {
            "taskId": "task_1_1",
            "website": "Autozone",
            "useCase": "Login",
            "status": "completed",
            "score": 0.9,
            "duration": 180,
            "startTime": "2024-01-15T10:00:00Z",
            "endTime": "2024-01-15T10:03:00Z"
          }
        ],
        "metadata": {
          "environment": "production",
          "version": "7.0.0",
          "resources": {
            "cpu": 45,
            "memory": 60,
            "storage": 75
          }
        }
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 5. Get Agent Run Details

**GET** `/api/v1/agents/{id}/runs/{runId}`

Retrieves detailed information for a specific agent run.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Agent ID |
| `runId` | string | Yes | Run ID |

#### Response

```json
{
  "data": {
    "run": {
      "runId": "run_autoppia_1234567890_1",
      "agentId": "autoppia-bittensor",
      "roundId": 20,
      "validatorId": "autoppia",
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T10:32:00Z",
      "status": "completed",
      "totalTasks": 10,
      "completedTasks": 10,
      "score": 0.87,
      "duration": 1920,
      "ranking": 5,
      "tasks": [
        {
          "taskId": "task_1_1",
          "website": "Autozone",
          "useCase": "Login",
          "status": "completed",
          "score": 0.9,
          "duration": 180,
          "startTime": "2024-01-15T10:00:00Z",
          "endTime": "2024-01-15T10:03:00Z"
        }
      ],
      "metadata": {
        "environment": "production",
        "version": "7.0.0",
        "resources": {
          "cpu": 45,
          "memory": 60,
          "storage": 75
        }
      }
    }
  }
}
```

### 6. Get Agent Activity

**GET** `/api/v1/agents/{id}/activity`

Retrieves recent activity for a specific agent.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Agent ID |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 20 | Number of activities to return |
| `offset` | integer | No | 0 | Number of activities to skip |
| `type` | string | No | - | Filter by activity type |
| `since` | string | No | - | Return activities after this timestamp |

#### Response

```json
{
  "data": {
    "activities": [
      {
        "id": "activity_autoppia_1",
        "type": "run_completed",
        "agentId": "autoppia-bittensor",
        "agentName": "Autoppia Bittensor",
        "message": "Agent Autoppia Bittensor completed run with score 0.87",
        "timestamp": "2024-01-15T10:32:00Z",
        "metadata": {
          "runId": "run_autoppia_1234567890_1",
          "roundId": 20,
          "validatorId": "autoppia",
          "score": 0.87,
          "duration": 1920
        }
      }
    ],
    "total": 50
  }
}
```

### 7. Compare Agents

**POST** `/api/v1/agents/compare`

Compares multiple agents across various metrics.

#### Request Body

```json
{
  "agentIds": ["autoppia-bittensor", "openai-cua", "anthropic-cua"],
  "timeRange": "7d",
  "startDate": "2024-01-08T10:00:00Z",
  "endDate": "2024-01-15T10:00:00Z",
  "metrics": ["score", "successRate", "duration", "runs"]
}
```

#### Response

```json
{
  "data": {
    "comparison": {
      "agents": [
        {
          "agentId": "autoppia-bittensor",
          "name": "Autoppia Bittensor",
          "metrics": {
            "averageScore": 0.87,
            "successRate": 87.3,
            "averageDuration": 32.5,
            "totalRuns": 150,
            "ranking": 1
          }
        }
      ],
      "comparisonMetrics": {
        "bestPerformer": "autoppia-bittensor",
        "mostReliable": "autoppia-bittensor",
        "fastest": "openai-cua",
        "mostActive": "autoppia-bittensor"
      },
      "timeRange": {
        "start": "2024-01-08T10:00:00Z",
        "end": "2024-01-15T10:00:00Z"
      }
    }
  }
}
```

### 8. Get Agent Statistics

**GET** `/api/v1/agents/statistics`

Retrieves overall statistics for all agents.

#### Response

```json
{
  "data": {
    "statistics": {
      "totalAgents": 5,
      "activeAgents": 5,
      "inactiveAgents": 0,
      "totalRuns": 3616,
      "successfulRuns": 2980,
      "averageSuccessRate": 82.4,
      "averageScore": 0.81,
      "topPerformingAgent": {
        "id": "autoppia-bittensor",
        "name": "Autoppia Bittensor",
        "score": 0.87
      },
      "mostActiveAgent": {
        "id": "autoppia-bittensor",
        "name": "Autoppia Bittensor",
        "runs": 1247
      },
      "performanceDistribution": {
        "excellent": 25,
        "good": 35,
        "average": 30,
        "poor": 10
      },
      "lastUpdated": "2024-01-15T10:00:00Z"
    }
  }
}
```

### 9. Get All Agent Activity

**GET** `/api/v1/agents/activity`

Retrieves activity across all agents.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 20 | Number of activities to return |
| `offset` | integer | No | 0 | Number of activities to skip |
| `type` | string | No | - | Filter by activity type |
| `since` | string | No | - | Return activities after this timestamp |
| `agentId` | string | No | - | Filter by specific agent ID |

#### Response

```json
{
  "data": {
    "activities": [
      {
        "id": "activity_global_1",
        "type": "run_completed",
        "agentId": "autoppia-bittensor",
        "agentName": "Autoppia Bittensor",
        "message": "Agent Autoppia Bittensor completed run with score 0.87",
        "timestamp": "2024-01-15T10:32:00Z",
        "metadata": {
          "runId": "run_autoppia_1234567890_1",
          "roundId": 20,
          "validatorId": "autoppia",
          "score": 0.87,
          "duration": 1920
        }
      }
    ],
    "total": 200
  }
}
```

## Data Models

### Agent

```typescript
interface Agent {
  id: string;
  name: string;
  type: 'autoppia' | 'openai' | 'anthropic' | 'browser-use' | 'custom';
  imageUrl: string;
  description?: string;
  version?: string;
  status: 'active' | 'inactive' | 'maintenance';
  totalRuns: number;
  successfulRuns: number;
  averageScore: number;
  bestScore: number;
  successRate: number;
  averageDuration: number;
  totalTasks: number;
  completedTasks: number;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}
```

### Agent Performance Metrics

```typescript
interface AgentPerformanceMetrics {
  agentId: string;
  timeRange: {
    start: string;
    end: string;
  };
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  successRate: number;
  averageDuration: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  scoreDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  performanceTrend: {
    period: string;
    score: number;
    successRate: number;
    duration: number;
  }[];
}
```

### Agent Run

```typescript
interface AgentRun {
  runId: string;
  agentId: string;
  roundId: number;
  validatorId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  totalTasks: number;
  completedTasks: number;
  score: number;
  duration: number;
  ranking?: number;
  tasks: {
    taskId: string;
    website: string;
    useCase: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    score: number;
    duration: number;
    startTime: string;
    endTime?: string;
    error?: string;
  }[];
  metadata: {
    environment: string;
    version: string;
    resources: {
      cpu: number;
      memory: number;
      storage: number;
    };
  };
}
```

### Agent Activity

```typescript
interface AgentActivity {
  id: string;
  type: 'run_started' | 'run_completed' | 'run_failed' | 'agent_created' | 'agent_updated' | 'agent_deactivated';
  agentId: string;
  agentName: string;
  message: string;
  timestamp: string;
  metadata: {
    runId?: string;
    roundId?: number;
    validatorId?: string;
    score?: number;
    duration?: number;
    error?: string;
  };
}
```

## Error Handling

### HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "data": null,
  "success": false,
  "message": null,
  "error": "Detailed error message"
}
```

## Rate Limiting

- **General endpoints**: 100 requests per minute per IP
- **Performance metrics**: 50 requests per minute per IP
- **Activity feeds**: 200 requests per minute per IP

## Caching

- **Agent lists**: 5 minutes
- **Agent details**: 2 minutes
- **Performance metrics**: 1 minute
- **Activity feeds**: 30 seconds
- **Statistics**: 5 minutes

## Implementation Notes

1. **Database Indexing**: Ensure proper indexing on frequently queried fields:
   - `agents.id`
   - `agents.type`
   - `agents.status`
   - `agent_runs.agent_id`
   - `agent_runs.start_time`
   - `agent_activities.agent_id`
   - `agent_activities.timestamp`

2. **Pagination**: Implement cursor-based pagination for large datasets to improve performance.

3. **Real-time Updates**: Consider implementing WebSocket connections for real-time activity feeds.

4. **Data Aggregation**: Pre-calculate performance metrics to improve response times.

5. **Security**: Implement proper input validation and sanitization for all endpoints.

6. **Monitoring**: Add comprehensive logging and monitoring for all endpoints.

## Testing

### Test Cases

1. **Agent List Endpoint**
   - Test pagination
   - Test filtering by type and status
   - Test sorting
   - Test search functionality

2. **Agent Details Endpoint**
   - Test valid agent ID
   - Test invalid agent ID
   - Test agent with no runs

3. **Performance Metrics Endpoint**
   - Test different time ranges
   - Test agents with no data
   - Test date range validation

4. **Runs Endpoint**
   - Test pagination
   - Test filtering by round and validator
   - Test date range filtering

5. **Activity Endpoint**
   - Test pagination
   - Test filtering by type
   - Test timestamp filtering

6. **Compare Endpoint**
   - Test multiple agents
   - Test single agent
   - Test invalid agent IDs

7. **Statistics Endpoint**
   - Test with no agents
   - Test with mixed agent statuses

### Performance Requirements

- **Response Time**: < 200ms for simple queries, < 1s for complex aggregations
- **Throughput**: Support 1000+ concurrent requests
- **Availability**: 99.9% uptime
- **Data Freshness**: Real-time for activity, 1-minute delay for metrics

## Deployment

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/autoppia
REDIS_URL=redis://localhost:6379

# API Configuration
API_PORT=8000
API_HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,https://dashboard.autoppia.com

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=24h

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Caching
CACHE_TTL_AGENTS=300
CACHE_TTL_METRICS=60
CACHE_TTL_ACTIVITY=30
```

### Docker Configuration

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

This specification provides a comprehensive guide for implementing the Agents API backend. The endpoints are designed to support all the functionality required by the frontend dashboard while maintaining good performance and scalability.
