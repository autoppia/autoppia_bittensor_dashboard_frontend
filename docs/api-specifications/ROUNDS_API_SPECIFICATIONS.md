# AutoPPIA Bittensor Dashboard - Rounds API Specifications

## Rounds Section API Endpoints

This document provides detailed specifications for the backend API endpoints required by the rounds section of the AutoPPIA Bittensor Dashboard frontend.

### Base Configuration

- **Base URL**: `http://localhost:8000/api/v1/rounds`
- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Authentication**: Bearer token (if required)

---

## 1. Rounds List

### GET `/api/v1/rounds`

Returns list of all rounds with optional filtering and pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `status` (string, optional): Filter by status (`active`, `completed`, `pending`)
- `sortBy` (string, optional): Sort field (`id`, `startTime`, `endTime`, `totalTasks`, `averageScore`)
- `sortOrder` (string, optional): Sort direction (`asc`, `desc`)

**Response:**
```json
{
  "success": true,
  "data": {
    "rounds": [
      {
        "id": 20,
        "startBlock": 6526001,
        "endBlock": 6527000,
        "current": true,
        "startTime": "2024-01-15T08:00:00Z",
        "endTime": null,
        "status": "active",
        "totalTasks": 1000,
        "completedTasks": 750,
        "averageScore": 0.85,
        "topScore": 0.95,
        "currentBlock": 6526300,
        "blocksRemaining": 700,
        "progress": 0.75
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 20
  },
  "error": null,
  "code": null
}
```

---

## 2. Round Details

### GET `/api/v1/rounds/{id}`

Returns detailed information for a specific round.

**Response:**
```json
{
  "success": true,
  "data": {
    "round": {
      "id": 20,
      "startBlock": 6526001,
      "endBlock": 6527000,
      "current": true,
      "startTime": "2024-01-15T08:00:00Z",
      "endTime": null,
      "status": "active",
      "totalTasks": 1000,
      "completedTasks": 750,
      "averageScore": 0.85,
      "topScore": 0.95,
      "currentBlock": 6526300,
      "blocksRemaining": 700,
      "progress": 0.75
    }
  },
  "error": null,
  "code": null
}
```

### GET `/api/v1/rounds/current`

Returns information about the current active round.

**Response:**
```json
{
  "success": true,
  "data": {
    "round": {
      "id": 20,
      "startBlock": 6526001,
      "endBlock": 6527000,
      "current": true,
      "startTime": "2024-01-15T08:00:00Z",
      "endTime": null,
      "status": "active",
      "totalTasks": 1000,
      "completedTasks": 750,
      "averageScore": 0.85,
      "topScore": 0.95,
      "currentBlock": 6526300,
      "blocksRemaining": 700,
      "progress": 0.75
    }
  },
  "error": null,
  "code": null
}
```

---

## 3. Round Statistics

### GET `/api/v1/rounds/{id}/statistics`

Returns comprehensive statistics for a specific round.

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "roundId": 20,
      "totalMiners": 50,
      "activeMiners": 45,
      "totalTasks": 1000,
      "completedTasks": 750,
      "averageScore": 0.85,
      "topScore": 0.95,
      "successRate": 0.75,
      "averageDuration": 32.5,
      "totalStake": 5000000,
      "totalEmission": 250000,
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  },
  "error": null,
  "code": null
}
```

---

## 4. Round Miners

### GET `/api/v1/rounds/{id}/miners`

Returns list of miners and their performance for a specific round.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `sortBy` (string, optional): Sort field (`score`, `duration`, `ranking`, `uid`)
- `sortOrder` (string, optional): Sort direction (`asc`, `desc`)
- `success` (boolean, optional): Filter by success status
- `minScore` (number, optional): Minimum score filter
- `maxScore` (number, optional): Maximum score filter

**Response:**
```json
{
  "success": true,
  "data": {
    "miners": [
      {
        "uid": 42,
        "hotkey": "5GHrA5gqhWVm1Cp92jXaoH7caxtE7xsFHxJooL5h8aE9mdTe",
        "success": true,
        "score": 0.92,
        "duration": 28,
        "ranking": 1,
        "tasksCompleted": 15,
        "tasksTotal": 15,
        "stake": 100000,
        "emission": 5000,
        "lastSeen": "2024-01-15T10:25:00Z",
        "validatorId": "validator_123"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  },
  "error": null,
  "code": null
}
```

### GET `/api/v1/rounds/{id}/miners/top`

Returns top performing miners for a round.

**Query Parameters:**
- `limit` (number, optional): Number of top miners to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "miners": [
      {
        "uid": 42,
        "hotkey": "5GHrA5gqhWVm1Cp92jXaoH7caxtE7xsFHxJooL5h8aE9mdTe",
        "success": true,
        "score": 0.92,
        "duration": 28,
        "ranking": 1,
        "tasksCompleted": 15,
        "tasksTotal": 15,
        "stake": 100000,
        "emission": 5000,
        "lastSeen": "2024-01-15T10:25:00Z",
        "validatorId": "validator_123"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 10
  },
  "error": null,
  "code": null
}
```

### GET `/api/v1/rounds/{id}/miners/{uid}`

Returns detailed performance data for a specific miner in a round.

**Response:**
```json
{
  "success": true,
  "data": {
    "miner": {
      "uid": 42,
      "hotkey": "5GHrA5gqhWVm1Cp92jXaoH7caxtE7xsFHxJooL5h8aE9mdTe",
      "success": true,
      "score": 0.92,
      "duration": 28,
      "ranking": 1,
      "tasksCompleted": 15,
      "tasksTotal": 15,
      "stake": 100000,
      "emission": 5000,
      "lastSeen": "2024-01-15T10:25:00Z",
      "validatorId": "validator_123"
    }
  },
  "error": null,
  "code": null
}
```

---

## 5. Round Validators

### GET `/api/v1/rounds/{id}/validators`

Returns validators and their performance for a specific round.

**Response:**
```json
{
  "success": true,
  "data": {
    "validators": [
      {
        "id": "validator_123",
        "name": "Autoppia 123",
        "hotkey": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "icon": "/validators/Autoppia_123.png",
        "status": "active",
        "totalTasks": 100,
        "completedTasks": 95,
        "averageScore": 0.88,
        "weight": 1000000,
        "trust": 0.95,
        "version": 7,
        "stake": 1000000,
        "emission": 50000,
        "lastSeen": "2024-01-15T10:25:00Z",
        "uptime": 99.5
      }
    ],
    "total": 6
  },
  "error": null,
  "code": null
}
```

### GET `/api/v1/rounds/{id}/validators/{validatorId}`

Returns detailed performance data for a specific validator in a round.

**Response:**
```json
{
  "success": true,
  "data": {
    "validator": {
      "id": "validator_123",
      "name": "Autoppia 123",
      "hotkey": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
      "icon": "/validators/Autoppia_123.png",
      "status": "active",
      "totalTasks": 100,
      "completedTasks": 95,
      "averageScore": 0.88,
      "weight": 1000000,
      "trust": 0.95,
      "version": 7,
      "stake": 1000000,
      "emission": 50000,
      "lastSeen": "2024-01-15T10:25:00Z",
      "uptime": 99.5
    }
  },
  "error": null,
  "code": null
}
```

---

## 6. Round Activity

### GET `/api/v1/rounds/{id}/activity`

Returns recent activity feed for a specific round.

**Query Parameters:**
- `limit` (number, optional): Number of activities to return (default: 10)
- `offset` (number, optional): Offset for pagination
- `type` (string, optional): Filter by activity type
- `since` (string, optional): ISO timestamp to filter activities since

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_1",
        "type": "task_completed",
        "message": "Miner 42 completed task with score 0.92",
        "timestamp": "2024-01-15T10:25:00Z",
        "metadata": {
          "minerUid": 42,
          "taskId": "task_123",
          "score": 0.92,
          "duration": 28
        }
      }
    ],
    "total": 25
  },
  "error": null,
  "code": null
}
```

---

## 7. Round Progress

### GET `/api/v1/rounds/{id}/progress`

Returns real-time progress information for a round.

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": {
      "roundId": 20,
      "currentBlock": 6526300,
      "startBlock": 6526001,
      "endBlock": 6527000,
      "blocksRemaining": 700,
      "progress": 0.75,
      "estimatedTimeRemaining": {
        "days": 0,
        "hours": 2,
        "minutes": 20,
        "seconds": 0
      },
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  },
  "error": null,
  "code": null
}
```

---

## 8. Round Summary

### GET `/api/v1/rounds/{id}/summary`

Returns quick summary statistics for a round.

**Response:**
```json
{
  "success": true,
  "data": {
    "roundId": 20,
    "status": "active",
    "progress": 0.75,
    "totalMiners": 50,
    "averageScore": 0.85,
    "topScore": 0.95,
    "timeRemaining": "2h 20m"
  },
  "error": null,
  "code": null
}
```

---

## 9. Round Comparison

### POST `/api/v1/rounds/compare`

Compares multiple rounds and returns comparative data.

**Request Body:**
```json
{
  "roundIds": [18, 19, 20]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rounds": [
      {
        "roundId": 20,
        "statistics": {
          "roundId": 20,
          "totalMiners": 50,
          "averageScore": 0.85,
          "topScore": 0.95
        },
        "topMiners": [
          {
            "uid": 42,
            "score": 0.92,
            "ranking": 1
          }
        ]
      }
    ]
  },
  "error": null,
  "code": null
}
```

---

## 10. Round Timeline

### GET `/api/v1/rounds/{id}/timeline`

Returns timeline data showing progress over time.

**Response:**
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "timestamp": "2024-01-15T08:00:00Z",
        "block": 6526001,
        "completedTasks": 0,
        "averageScore": 0.0,
        "activeMiners": 0
      },
      {
        "timestamp": "2024-01-15T09:00:00Z",
        "block": 6526100,
        "completedTasks": 250,
        "averageScore": 0.75,
        "activeMiners": 45
      }
    ]
  },
  "error": null,
  "code": null
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "data": null,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (round doesn't exist)
- `500`: Internal Server Error

---

## Implementation Notes

1. **Real-time Updates**: Consider WebSocket connections for live progress updates
2. **Caching**: Implement caching for frequently accessed round data
3. **Pagination**: All list endpoints should support pagination for large datasets
4. **Filtering**: Implement comprehensive filtering options for better user experience
5. **Performance**: Optimize database queries and consider indexing for frequently queried fields
6. **Data Validation**: Validate all input parameters and return appropriate error messages

---

## Environment Variables

The frontend expects the following environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

This can be configured for different environments (development, staging, production).
