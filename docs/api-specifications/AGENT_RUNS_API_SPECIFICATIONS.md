# Agent Runs API Specifications

This document outlines the API endpoints for managing agent evaluation runs in the AutoPPIA Bittensor Dashboard.

## Base URL
```
/api/v1/agent-runs
```

## Authentication
All endpoints require authentication via API key or JWT token.

## Endpoints

### 1. List Agent Runs
**GET** `/api/v1/agent-runs`

Retrieve a paginated list of agent runs with optional filters. This endpoint powers the Agent Run Search view.

#### Query Parameters
- `query` (optional): Free-text search across run ID, agent ID, and validator metadata.
- `page` (optional, default: 1): Page number.
- `limit` (optional, default: 20): Page size.
- `roundId` (optional): Filter by round identifier.
- `validatorId` (optional): Filter by validator UID.
- `agentId` (optional): Filter by agent UID.
- `status` (optional): Filter by run status (`running`, `completed`, `failed`, `timeout`).
- `sortBy` (optional): Sort field (`startTime`, `score`, `duration`, `ranking`).
- `sortOrder` (optional): Sort direction (`asc`, `desc`).
- `startDate` / `endDate` (optional): Filter runs that started within a time range (ISO 8601).

#### Response
```json
{
  "data": {
    "runs": [
      {
        "runId": "b8l3-0n5y",
        "agentId": "agent-42",
        "agentName": "AutoPPIA Agent",
        "roundId": 21,
        "validatorId": "autoppia",
        "validatorName": "AutoPPIA",
        "validatorImage": "/validators/Autoppia.png",
        "status": "completed",
        "startTime": "2024-04-21T18:00:00Z",
        "endTime": "2024-04-21T18:12:00Z",
        "totalTasks": 180,
        "completedTasks": 176,
        "successfulTasks": 152,
        "overallScore": 0.87,
        "successRate": 84,
        "ranking": 3
      }
    ],
    "total": 428,
    "page": 1,
    "limit": 50,
    "facets": {
      "validators": [
        { "id": "autoppia", "name": "AutoPPIA", "count": 132 },
        { "id": "kraken", "name": "Kraken Validator", "count": 94 }
      ],
      "rounds": [
        { "id": 21, "count": 65 },
        { "id": 20, "count": 58 }
      ],
      "agents": [
        { "id": "agent-42", "name": "AutoPPIA Agent", "count": 32 },
        { "id": "agent-108", "name": "Kraken Agent", "count": 21 }
      ],
      "statuses": [
        { "name": "completed", "count": 372 },
        { "name": "failed", "count": 41 }
      ]
    }
  }
}
```

### 2. Get Agent Run Details
**GET** `/api/v1/agent-runs/{runId}`

Get comprehensive details for a specific agent run.

#### Parameters
- `runId` (path, required): The unique identifier of the agent run
- `includeTasks` (query, optional): Include task details (default: false)
- `includeStats` (query, optional): Include statistics (default: false)
- `includeSummary` (query, optional): Include summary (default: false)
- `includePersonas` (query, optional): Include personas data (default: false)

#### Response
```json
{
  "data": {
    "run": {
      "runId": "a7k2-9m4x",
      "agentId": "agent-42",
      "roundId": 11,
      "validatorId": "autoppia",
      "validatorName": "AutoPPIA",
      "validatorImage": "/validators/Autoppia.png",
      "startTime": "2024-01-15T10:30:00Z",
      "endTime": "2024-01-15T11:45:00Z",
      "status": "completed",
      "totalTasks": 360,
      "completedTasks": 360,
      "successfulTasks": 233,
      "failedTasks": 127,
      "score": 0.91,
      "ranking": 2,
      "duration": 4500,
      "overallScore": 91,
      "websites": [
        {
          "website": "Autozone",
          "tasks": 120,
          "successful": 95,
          "failed": 25,
          "score": 0.92
        }
      ],
      "tasks": [
        {
          "taskId": "task-3413",
          "website": "Autozone",
          "useCase": "buy_product",
          "prompt": "Buy a product which has a price of 1000",
          "status": "completed",
          "score": 0.82,
          "duration": 45,
          "startTime": "2024-01-15T10:30:00Z",
          "endTime": "2024-01-15T10:30:45Z",
          "actions": []
        }
      ],
      "metadata": {
        "environment": "production",
        "version": "1.2.3",
        "resources": {
          "cpu": 2.5,
          "memory": 1024,
          "storage": 512
        }
      }
    }
  }
}
```

### 3. Get Agent Run Personas
**GET** `/api/v1/agent-runs/{runId}/personas`

Get personas data (round, validator, agent information) for an agent run.

#### Response
```json
{
  "data": {
    "personas": {
      "round": {
        "id": 11,
        "name": "Round 11",
        "status": "active",
        "startTime": "2024-01-15T00:00:00Z",
        "endTime": "2024-01-15T23:59:59Z"
      },
      "validator": {
        "id": "autoppia",
        "name": "AutoPPIA",
        "image": "/validators/Autoppia.png",
        "description": "AutoPPIA Validator",
        "website": "https://autoppia.com",
        "github": "https://github.com/autoppia"
      },
      "agent": {
        "id": "agent-42",
        "name": "AutoPPIA Agent",
        "type": "autoppia",
        "image": "/agents/autoppia.png",
        "description": "AutoPPIA's main agent"
      }
    }
  }
}
```

### 4. Get Agent Run Statistics
**GET** `/api/v1/agent-runs/{runId}/stats`

Get detailed statistics for an agent run.

#### Response
```json
{
  "data": {
    "stats": {
      "runId": "a7k2-9m4x",
      "overallScore": 91,
      "totalTasks": 360,
      "successfulTasks": 233,
      "failedTasks": 127,
      "websites": 3,
      "averageTaskDuration": 45.2,
      "successRate": 64.7,
      "scoreDistribution": {
        "excellent": 45,
        "good": 120,
        "average": 68,
        "poor": 127
      },
      "performanceByWebsite": [
        {
          "website": "Autozone",
          "tasks": 120,
          "successful": 95,
          "failed": 25,
          "averageScore": 0.92,
          "averageDuration": 42.1
        }
      ],
      "performanceByUseCase": [
        {
          "useCase": "buy_product",
          "tasks": 80,
          "successful": 65,
          "failed": 15,
          "averageScore": 0.88,
          "averageDuration": 38.5
        }
      ]
    }
  }
}
```

### 5. Get Agent Run Summary
**GET** `/api/v1/agent-runs/{runId}/summary`

Get summary information for an agent run.

#### Response
```json
{
  "data": {
    "summary": {
      "runId": "a7k2-9m4x",
      "agentId": "agent-42",
      "roundId": 11,
      "validatorId": "autoppia",
      "startTime": "2024-01-15T10:30:00Z",
      "endTime": "2024-01-15T11:45:00Z",
      "status": "completed",
      "overallScore": 91,
      "totalTasks": 360,
      "successfulTasks": 233,
      "failedTasks": 127,
      "duration": 4500,
      "ranking": 2,
      "topPerformingWebsite": {
        "website": "Autozone",
        "score": 0.92,
        "tasks": 120
      },
      "topPerformingUseCase": {
        "useCase": "buy_product",
        "score": 0.88,
        "tasks": 80
      },
      "recentActivity": [
        {
          "timestamp": "2024-01-15T11:45:00Z",
          "action": "run_completed",
          "details": "Agent run completed successfully"
        }
      ]
    }
  }
}
```

### 6. Get Agent Run Tasks
**GET** `/api/v1/agent-runs/{runId}/tasks`

Get tasks for an agent run with pagination and filtering.

#### Parameters
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)
- `website` (query, optional): Filter by website
- `useCase` (query, optional): Filter by use case
- `status` (query, optional): Filter by status
- `sortBy` (query, optional): Sort field (startTime, score, duration)
- `sortOrder` (query, optional): Sort order (asc, desc)

#### Response
```json
{
  "data": {
    "tasks": [
      {
        "taskId": "task-3413",
        "website": "Autozone",
        "useCase": "buy_product",
        "prompt": "Buy a product which has a price of 1000",
        "status": "completed",
        "score": 0.82,
        "duration": 45,
        "startTime": "2024-01-15T10:30:00Z",
        "endTime": "2024-01-15T10:30:45Z",
        "actions": [
          {
            "id": "action-1",
            "type": "navigate",
            "selector": null,
            "value": "http://localhost:8000/",
            "timestamp": "2024-01-15T10:30:00Z",
            "duration": 2.1,
            "success": true
          }
        ],
        "screenshots": ["replay-1.gif"],
        "logs": ["Task started", "Navigation successful"]
      }
    ],
    "total": 360,
    "page": 1,
    "limit": 20
  }
}
```

> ℹ️ **Screenshots vs GIF replays:** the `screenshots` array is reused in the frontend to render animated GIF replays for each task. When the backend provides a `.gif` URL the UI will show the looping replay instead of a static frame, so prefer exporting GIF files here.

### 7. Get Agent Runs by Agent
**GET** `/api/v1/agents/{agentId}/runs`

Get all agent runs for a specific agent.

#### Parameters
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)
- `roundId` (query, optional): Filter by round ID
- `validatorId` (query, optional): Filter by validator ID
- `status` (query, optional): Filter by status
- `sortBy` (query, optional): Sort field (startTime, score, duration, ranking)
- `sortOrder` (query, optional): Sort order (asc, desc)

### 8. Get Agent Runs by Round
**GET** `/api/v1/rounds/{roundId}/agent-runs`

Get all agent runs for a specific round.

#### Parameters
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)
- `validatorId` (query, optional): Filter by validator ID
- `status` (query, optional): Filter by status
- `sortBy` (query, optional): Sort field (startTime, score, duration, ranking)
- `sortOrder` (query, optional): Sort order (asc, desc)

### 9. Get Agent Runs by Validator
**GET** `/api/v1/validators/{validatorId}/agent-runs`

Get all agent runs for a specific validator.

#### Parameters
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)
- `roundId` (query, optional): Filter by round ID
- `status` (query, optional): Filter by status
- `sortBy` (query, optional): Sort field (startTime, score, duration, ranking)
- `sortOrder` (query, optional): Sort order (asc, desc)

### 10. Compare Agent Runs
**POST** `/api/v1/agent-runs/compare`

Compare multiple agent runs.

#### Request Body
```json
{
  "runIds": ["a7k2-9m4x", "b3n8-2p5q", "c9r1-6s7t"]
}
```

#### Response
```json
{
  "data": {
    "runs": [...],
    "comparison": {
      "bestScore": "a7k2-9m4x",
      "fastest": "b3n8-2p5q",
      "mostTasks": "c9r1-6s7t",
      "bestSuccessRate": "a7k2-9m4x"
    }
  }
}
```

### 11. Get Agent Run Timeline
**GET** `/api/v1/agent-runs/{runId}/timeline`

Get timeline of events for an agent run.

#### Response
```json
{
  "data": {
    "events": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "type": "run_started",
        "message": "Agent run started",
        "metadata": {
          "agentId": "agent-42",
          "roundId": 11
        }
      },
      {
        "timestamp": "2024-01-15T10:30:05Z",
        "type": "task_started",
        "taskId": "task-3413",
        "message": "Task started: Buy a product",
        "metadata": {
          "website": "Autozone",
          "useCase": "buy_product"
        }
      }
    ]
  }
}
```

### 12. Get Agent Run Logs
**GET** `/api/v1/agent-runs/{runId}/logs`

Get logs for an agent run.

#### Parameters
- `level` (query, optional): Log level (info, warn, error, debug)
- `limit` (query, optional): Number of logs to return (default: 100)
- `offset` (query, optional): Number of logs to skip (default: 0)

#### Response
```json
{
  "data": {
    "logs": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "level": "info",
        "message": "Agent run started",
        "metadata": {
          "agentId": "agent-42",
          "roundId": 11
        }
      }
    ],
    "total": 150
  }
}
```

### 13. Get Agent Run Metrics
**GET** `/api/v1/agent-runs/{runId}/metrics`

Get performance metrics for an agent run.

#### Response
```json
{
  "data": {
    "metrics": {
      "cpu": [
        {
          "timestamp": "2024-01-15T10:30:00Z",
          "value": 25.5
        }
      ],
      "memory": [
        {
          "timestamp": "2024-01-15T10:30:00Z",
          "value": 512
        }
      ],
      "network": [
        {
          "timestamp": "2024-01-15T10:30:00Z",
          "value": 1024
        }
      ],
      "duration": 4500,
      "peakCpu": 85.2,
      "peakMemory": 1024,
      "totalNetworkTraffic": 2048000
    }
  }
}
```

## Error Responses

All endpoints return standard HTTP status codes and error responses:

```json
{
  "error": {
    "code": "AGENT_RUN_NOT_FOUND",
    "message": "Agent run with ID 'invalid-id' not found",
    "details": {
      "runId": "invalid-id"
    }
  }
}
```

## Rate Limiting

- 100 requests per minute per API key
- 1000 requests per hour per API key

## Partial Loading Support

The API supports partial loading for better performance:

1. **Personas Endpoint**: Fast-loading basic information (round, validator, agent)
2. **Stats Endpoint**: Statistical data and performance metrics
3. **Summary Endpoint**: High-level summary information
4. **Tasks Endpoint**: Detailed task information with pagination

Components can load these endpoints independently and progressively to improve user experience.

## Caching

- Personas data: 5 minutes
- Stats data: 2 minutes
- Summary data: 1 minute
- Tasks data: 30 seconds
- Timeline/Logs: No caching

## WebSocket Support

Real-time updates are available via WebSocket for:
- Agent run status changes
- Task completion updates
- Performance metrics updates

WebSocket endpoint: `ws://api.autoppia.com/v1/agent-runs/{runId}/stream`
