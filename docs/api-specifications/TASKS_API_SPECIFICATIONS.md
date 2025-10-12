# Tasks API Specifications

This document outlines the API endpoints for managing tasks in the AutoPPIA Bittensor Dashboard.

## Base URL
```
/api/v1/tasks
```

## Authentication
All endpoints require authentication via API key or JWT token.

## Endpoints

### 1. Get Task Details
**GET** `/api/v1/tasks/{taskId}`

Get comprehensive details for a specific task.

#### Parameters
- `taskId` (path, required): The unique identifier of the task
- `includeActions` (query, optional): Include task actions (default: false)
- `includeScreenshots` (query, optional): Include screenshots/GIF replays (default: false)
- `includeLogs` (query, optional): Include logs (default: false)
- `includeMetadata` (query, optional): Include metadata (default: false)

#### Response
```json
{
  "data": {
    "task": {
      "taskId": "task-3413",
      "agentRunId": "a7k2-9m4x",
      "website": "Autozone",
      "useCase": "buy_product",
      "prompt": "Buy a product which has a price of 1000",
      "status": "completed",
      "score": 0.82,
      "successRate": 75,
      "duration": 45,
      "startTime": "2024-01-15T10:30:00Z",
      "endTime": "2024-01-15T10:30:45Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:45Z",
      "actions": [
        {
          "id": "action-1",
          "type": "navigate",
          "selector": null,
          "value": "http://localhost:8000/",
          "timestamp": "2024-01-15T10:30:00Z",
          "duration": 2.1,
          "success": true,
          "screenshot": "replay-1.gif"
        }
      ],
      "screenshots": ["replay-1.gif", "replay-2.gif"],
      "logs": ["Task started", "Navigation successful", "Task completed"],
      "metadata": {
        "environment": "production",
        "browser": "chrome",
        "viewport": {
          "width": 1920,
          "height": 1080
        },
        "userAgent": "Mozilla/5.0..."
      }
    }
  }
}
```

> ℹ️ **Media format:** the `screenshots` collection is used by the dashboard to render animated GIF replays. Supplying `.gif` URLs delivers a full playback inside the Task Detail panel; static images still work but won't show motion.

### 2. Get Task Personas
**GET** `/api/v1/tasks/{taskId}/personas`

Get personas data (round, validator, agent, task information) for a task.

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
      },
      "task": {
        "id": "task-3413",
        "website": "Autozone",
        "useCase": "buy_product",
        "status": "completed",
        "score": 0.82
      }
    }
  }
}
```

### 3. Get Task Details (Extended)
**GET** `/api/v1/tasks/{taskId}/details`

Return the complete payload required to render the Task Detail view (summary metrics, agent run metadata, performance counters, and raw execution artefacts).

#### Query Parameters
- `includeActions` (query, optional, default: `true`): Toggle inclusion of the `actions` array. Set to `false` for lightweight summaries.
- `includeScreenshots` (query, optional, default: `true`): When `false`, omits the `screenshots` array (used for looping GIF replays in the UI).
- `includeLogs` (query, optional, default: `true`): When `false`, omits execution log messages.
- `includePerformance` (query, optional, default: `true`): When `false`, omits the `performance` object.
- `includeMetadata` (query, optional, default: `true`): When `false`, omits the `metadata` object.

If a flag is `false`, the corresponding key MUST be either omitted or set to `null`.

#### Response
```json
{
  "data": {
    "details": {
      "taskId": "task-3413",
      "agentRunId": "b8l3-0n5y",
      "website": "autodining",
      "useCase": "book_reservation",
      "prompt": "Book a table for four people at 7 PM tonight.",
      "status": "completed",
      "score": 0.75,
      "successRate": 68,
      "duration": 60,
      "startTime": "2024-03-15T18:02:11Z",
      "endTime": "2024-03-15T18:03:11Z",
      "createdAt": "2024-03-15T18:02:11Z",
      "updatedAt": "2024-03-15T18:03:11Z",
      "actions": [
        {
          "id": "action-001",
          "type": "navigate",
          "timestamp": "2024-03-15T18:02:11Z",
          "duration": 1.2,
          "success": true,
          "value": "https://autodining.autoppia.com/",
          "metadata": {
            "target": "_self"
          },
          "screenshot": "https://cdn.autoppia.com/tasks/task-3413/action-001.gif"
        }
      ],
      "screenshots": [
        "https://cdn.autoppia.com/tasks/task-3413/summary.gif",
        "https://cdn.autoppia.com/tasks/task-3413/cart.gif"
      ],
      "logs": [
        "Task started",
        "Reservation flow executed",
        "Task completed successfully"
      ],
      "performance": {
        "totalActions": 14,
        "successfulActions": 13,
        "failedActions": 1,
        "averageActionDuration": 3.5,
        "totalWaitTime": 12.4,
        "totalNavigationTime": 6.1
      },
      "metadata": {
        "environment": "production",
        "browser": "chrome",
        "viewport": {
          "width": 1920,
          "height": 1080
        },
        "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "resources": {
          "cpu": 2.2,
          "memory": 485,
          "network": 892
        }
      }
    }
  }
}
```

#### Field Reference

| Path | Type | Description |
| --- | --- | --- |
| `details.taskId` | `string` | Unique identifier for the task execution. |
| `details.agentRunId` | `string` | Identifier of the agent run associated with the task. |
| `details.website` | `string` | Synthetic website slug (lowercase, underscore-free). |
| `details.useCase` | `string` | Use case slug that categorises the task. |
| `details.score` | `number` | Final evaluation score (0–1, two decimal precision recommended). |
| `details.successRate` | `number` | Percentage of successful actions (0–100). |
| `details.duration` | `number` | Total execution time in seconds. |
| `details.actions[]` | `TaskAction` | Ordered list of low-level actions executed by the agent. |
| `details.performance.totalActions` | `number` | Count of actions in the run. |
| `details.performance.failedActions` | `number` | Count of actions flagged as failures. |
| `details.metadata.environment` | `string` | Runtime environment label (`production`, `staging`, etc.). |
| `details.metadata.resources.cpu` | `number` | Average CPU usage percentage recorded during the run. |

> **Note:** The `TaskAction` shape follows the contract defined in [Get Task Actions](#11-get-task-actions).

### 4. Get Task Results
**GET** `/api/v1/tasks/{taskId}/results`

Get results and execution details for a specific task.

#### Response
```json
{
  "data": {
    "results": {
      "taskId": "task-3413",
      "status": "completed",
      "score": 0.82,
      "duration": 45,
      "actions": [...],
      "screenshots": [...], // GIF replays or still images
      "logs": [...],
      "summary": {
        "totalActions": 15,
        "successfulActions": 12,
        "failedActions": 3,
        "actionTypes": {
          "navigate": 1,
          "click": 8,
          "type": 3,
          "wait": 2,
          "scroll": 1,
          "screenshot": 0,
          "other": 0
        }
      },
      "timeline": [
        {
          "timestamp": "2024-01-15T10:30:00Z",
          "action": "NavigateAction",
          "duration": 2.1,
          "success": true
        },
        {
          "timestamp": "2024-01-15T10:30:05Z",
          "action": "WaitAction",
          "duration": 5.0,
          "success": true
        }
      ]
    }
  }
}
```

### 5. Get Task Statistics
**GET** `/api/v1/tasks/{taskId}/statistics`

Get statistics for a specific task.

#### Response
```json
{
  "data": {
    "statistics": {
      "totalTasks": 1,
      "completedTasks": 1,
      "failedTasks": 0,
      "runningTasks": 0,
      "averageScore": 0.82,
      "averageDuration": 45,
      "successRate": 100,
      "performanceByWebsite": [
        {
          "website": "Autozone",
          "tasks": 1,
          "successful": 1,
          "failed": 0,
          "averageScore": 0.82,
          "averageDuration": 45
        }
      ],
      "performanceByUseCase": [
        {
          "useCase": "buy_product",
          "tasks": 1,
          "successful": 1,
          "failed": 0,
          "averageScore": 0.82,
          "averageDuration": 45
        }
      ],
      "recentActivity": [
        {
          "timestamp": "2024-01-15T10:30:45Z",
          "action": "task_completed",
          "details": "Task completed successfully with score 0.82"
        }
      ]
    }
  }
}
```

### 6. Get Tasks List
**GET** `/api/v1/tasks`

Get list of tasks with filtering and pagination.

#### Parameters
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)
- `agentRunId` (query, optional): Filter by agent run ID
- `website` (query, optional): Filter by website
- `useCase` (query, optional): Filter by use case
- `status` (query, optional): Filter by status
- `sortBy` (query, optional): Sort field (startTime, score, duration, createdAt)
- `sortOrder` (query, optional): Sort order (asc, desc)
- `startDate` (query, optional): Filter by start date (ISO 8601)
- `endDate` (query, optional): Filter by end date (ISO 8601)

#### Response
```json
{
  "data": {
    "tasks": [
      {
        "taskId": "task-3413",
        "agentRunId": "a7k2-9m4x",
        "website": "Autozone",
        "useCase": "buy_product",
        "prompt": "Buy a product which has a price of 1000",
        "status": "completed",
        "score": 0.82,
        "successRate": 75,
        "duration": 45,
        "startTime": "2024-01-15T10:30:00Z",
        "endTime": "2024-01-15T10:30:45Z",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:45Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

### 7. Get Tasks by Agent Run
**GET** `/api/v1/tasks?agentRunId={agentRunId}`

Get all tasks for a specific agent run.

#### Parameters
Same as tasks list endpoint, with `agentRunId` automatically set.

### 8. Get Tasks by Website
**GET** `/api/v1/tasks?website={website}`

Get all tasks for a specific website.

#### Parameters
Same as tasks list endpoint, with `website` automatically set.

### 9. Get Tasks by Use Case
**GET** `/api/v1/tasks?useCase={useCase}`

Get all tasks for a specific use case.

#### Parameters
Same as tasks list endpoint, with `useCase` automatically set.

### 10. Search Tasks
**GET** `/api/v1/tasks/search`

Advanced search for tasks with multiple filters.

#### Parameters
- `query` (query, optional): Search query
- `website` (query, optional): Filter by website
- `useCase` (query, optional): Filter by use case
- `status` (query, optional): Filter by status
- `agentRunId` (query, optional): Filter by agent run ID
- `minScore` (query, optional): Minimum score filter
- `maxScore` (query, optional): Maximum score filter
- `startDate` (query, optional): Filter by start date
- `endDate` (query, optional): Filter by end date
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)
- `sortBy` (query, optional): Sort field
- `sortOrder` (query, optional): Sort order (asc, desc)

#### Response
```json
{
  "data": {
    "tasks": [...],
    "total": 150,
    "page": 1,
    "limit": 20,
    "facets": {
      "websites": [
        { "name": "Autozone", "count": 45 },
        { "name": "AutoDining", "count": 32 }
      ],
      "useCases": [
        { "name": "buy_product", "count": 28 },
        { "name": "book_reservation", "count": 15 }
      ],
      "statuses": [
        { "name": "completed", "count": 120 },
        { "name": "failed", "count": 30 }
      ],
      "scoreRanges": [
        { "range": "0.8-1.0", "count": 45 },
        { "range": "0.6-0.8", "count": 60 }
      ]
    }
  }
}
```

### 11. Get Task Actions
**GET** `/api/v1/tasks/{taskId}/actions`

Get actions for a specific task with pagination.

#### Parameters
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)
- `type` (query, optional): Filter by action type
- `sortBy` (query, optional): Sort field (timestamp, duration)
- `sortOrder` (query, optional): Sort order (asc, desc)

#### Response
```json
{
  "data": {
    "actions": [
      {
        "id": "action-1",
        "type": "navigate",
        "selector": null,
        "value": "http://localhost:8000/",
        "timestamp": "2024-01-15T10:30:00Z",
        "duration": 2.1,
        "success": true,
        "error": null,
        "metadata": {
          "url": "http://localhost:8000/",
          "statusCode": 200
        },
        "screenshot": "replay-1.gif"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

### 12. Get Task Screenshots
**GET** `/api/v1/tasks/{taskId}/screenshots`

Get screenshots or GIF replays for a specific task.

#### Response
```json
{
  "data": {
    "screenshots": [
      {
        "id": "screenshot-1",
        "url": "/screenshots/task-3413/replay-1.gif",
        "timestamp": "2024-01-15T10:30:00Z",
        "actionId": "action-1",
        "description": "Initial page load"
      },
      {
        "id": "screenshot-2",
        "url": "/screenshots/task-3413/replay-2.gif",
        "timestamp": "2024-01-15T10:30:15Z",
        "actionId": "action-5",
        "description": "After clicking product"
      }
    ]
  }
}

> 🔁 **Media format guidance:** even though we keep the endpoint name for backwards compatibility, the dashboard now renders animated GIFs inside the Task Detail panel. Prefer serving GIF (or other animated) assets through this endpoint so users get the full playback.
```

### 13. Get Task Logs
**GET** `/api/v1/tasks/{taskId}/logs`

Get logs for a specific task.

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
        "message": "Task started: Buy a product which has a price of 1000",
        "metadata": {
          "taskId": "task-3413",
          "website": "Autozone",
          "useCase": "buy_product"
        }
      },
      {
        "timestamp": "2024-01-15T10:30:02Z",
        "level": "info",
        "message": "Navigation successful to http://localhost:8000/",
        "metadata": {
          "actionId": "action-1",
          "statusCode": 200
        }
      }
    ],
    "total": 25
  }
}
```

### 14. Get Task Metrics
**GET** `/api/v1/tasks/{taskId}/metrics`

Get performance metrics for a specific task.

#### Response
```json
{
  "data": {
    "metrics": {
      "duration": 45,
      "actionsPerSecond": 0.33,
      "averageActionDuration": 3.0,
      "totalWaitTime": 10.5,
      "totalNavigationTime": 5.2,
      "memoryUsage": [
        {
          "timestamp": "2024-01-15T10:30:00Z",
          "value": 256
        }
      ],
      "cpuUsage": [
        {
          "timestamp": "2024-01-15T10:30:00Z",
          "value": 15.5
        }
      ]
    }
  }
}
```

### 15. Get Task Timeline
**GET** `/api/v1/tasks/{taskId}/timeline`

Get timeline of events for a specific task.

#### Response
```json
{
  "data": {
    "timeline": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "action": "NavigateAction",
        "duration": 2.1,
        "success": true,
        "metadata": {
          "url": "http://localhost:8000/",
          "statusCode": 200
        }
      },
      {
        "timestamp": "2024-01-15T10:30:05Z",
        "action": "WaitAction",
        "duration": 5.0,
        "success": true,
        "metadata": {
          "waitTime": 5.0
        }
      }
    ]
  }
}
```

### 16. Compare Tasks
**POST** `/api/v1/tasks/compare`

Compare multiple tasks.

#### Request Body
```json
{
  "taskIds": ["task-3413", "task-3414", "task-3415"]
}
```

#### Response
```json
{
  "data": {
    "tasks": [...],
    "comparison": {
      "bestScore": "task-3413",
      "fastest": "task-3415",
      "mostActions": "task-3414",
      "bestSuccessRate": "task-3413"
    }
  }
}
```

### 17. Get Task Analytics
**GET** `/api/v1/tasks/analytics`

Get analytics data for tasks.

#### Parameters
- `timeRange` (query, optional): Time range (1h, 24h, 7d, 30d, 90d)
- `website` (query, optional): Filter by website
- `useCase` (query, optional): Filter by use case
- `agentRunId` (query, optional): Filter by agent run ID

#### Response
```json
{
  "data": {
    "analytics": {
      "totalTasks": 150,
      "completedTasks": 120,
      "failedTasks": 30,
      "averageScore": 0.75,
      "averageDuration": 52.3,
      "successRate": 80,
      "performanceByWebsite": [...],
      "performanceByUseCase": [...],
      "performanceOverTime": [
        {
          "timestamp": "2024-01-15T10:00:00Z",
          "tasks": 5,
          "averageScore": 0.78,
          "successRate": 80
        }
      ]
    }
  }
}
```

## Error Responses

All endpoints return standard HTTP status codes and error responses:

```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task with ID 'invalid-id' not found",
    "details": {
      "taskId": "invalid-id"
    }
  }
}
```

## Rate Limiting

- 100 requests per minute per API key
- 1000 requests per hour per API key

## Partial Loading Support

The API supports partial loading for better performance:

1. **Personas Endpoint**: Fast-loading basic information (round, validator, agent, task)
2. **Details Endpoint**: Detailed task information with performance metrics
3. **Results Endpoint**: Task execution results and timeline
4. **Statistics Endpoint**: Statistical data and performance metrics

Components can load these endpoints independently and progressively to improve user experience.

## Caching

- Personas data: 5 minutes
- Details data: 2 minutes
- Results data: 1 minute
- Statistics data: 30 seconds
- Actions/Logs: No caching

## WebSocket Support

Real-time updates are available via WebSocket for:
- Task status changes
- Action execution updates
- Performance metrics updates

WebSocket endpoint: `ws://api.autoppia.com/v1/tasks/{taskId}/stream`
