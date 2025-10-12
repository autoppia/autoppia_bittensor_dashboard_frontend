# AutoPPIA Bittensor Dashboard - API Specifications

## Overview Section API Endpoints

This document provides detailed specifications for the backend API endpoints required by the overview section of the AutoPPIA Bittensor Dashboard frontend.

### Base Configuration

- **Base URL**: `http://localhost:8000/api/v1/overview` (configurable via `NEXT_PUBLIC_API_BASE_URL`)
- **Content-Type**: `application/json`
- **Accept**: `application/json`
- **Authentication**: Bearer token (if required)

---

## 1. Overview Metrics

### GET `/api/v1/overview/metrics`

Returns high-level metrics for the overview dashboard.

**Response:**
```json
{
  "data": {
    "metrics": {
      "topScore": 0.95,
      "totalWebsites": 11,
      "totalValidators": 6,
      "totalMiners": 50,
      "currentRound": 20,
      "subnetVersion": "1.0.0",
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  },
  "success": true
}
```

**Fields:**
- `topScore` (number): Current highest score achieved
- `totalWebsites` (number): Total number of available websites
- `totalValidators` (number): Number of active validators
- `totalMiners` (number): Number of registered miners
- `currentRound` (number): Current round number
- `subnetVersion` (string): Current subnet version
- `lastUpdated` (string): ISO timestamp of last data update

---

## 2. Validators

### GET `/api/v1/overview/validators`

Returns list of validators with optional filtering and pagination.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status (`Sending Tasks`, `Evaluating`, `Waiting`, `Offline`)
- `sortBy` (string, optional): Sort field (`weight`, `trust`, `totalTasks`, `name`)
- `sortOrder` (string, optional): Sort direction (`asc`, `desc`)

**Response:**
```json
{
  "data": {
    "validators": [
      {
        "id": "autoppia",
        "name": "Autoppia",
        "hotkey": "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
        "icon": "/validators/Autoppia.png",
        "currentTask": "Login for the following username:user<web_agent_id> and password:password123...",
        "status": "Sending Tasks",
        "totalTasks": 5787,
        "weight": 1722467.28,
        "trust": 1.0,
        "version": 7,
        "lastSeen": "2024-01-15T10:25:00Z",
        "uptime": 99.5,
        "stake": 1000000,
        "emission": 50000
      }
    ],
    "total": 6,
    "page": 1,
    "limit": 10
  },
  "success": true
}
```

### GET `/api/v1/overview/validators/{id}`

Returns details for a specific validator.

**Response:**
```json
{
  "data": {
    "validator": {
      "id": "autoppia",
      "name": "Autoppia",
      "hotkey": "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
      "icon": "/validators/Autoppia.png",
      "currentTask": "Login for the following username:user<web_agent_id> and password:password123...",
      "status": "Sending Tasks",
      "totalTasks": 5787,
      "weight": 1722467.28,
      "trust": 1.0,
      "version": 7,
      "lastSeen": "2024-01-15T10:25:00Z",
      "uptime": 99.5,
      "stake": 1000000,
      "emission": 50000
    }
  },
  "success": true
}
```

---

## 3. Rounds

### GET `/api/v1/overview/rounds/current`

Returns information about the current round.

**Response:**
```json
{
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
      "topScore": 0.95
    }
  },
  "success": true
}
```

### GET `/api/v1/overview/rounds`

Returns list of rounds with optional filtering.

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `status` (string, optional): Filter by status (`active`, `completed`, `pending`)
- `includeCurrent` (boolean, optional): Include current round

**Response:**
```json
{
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
        "topScore": 0.95
      }
    ],
    "currentRound": {
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
      "topScore": 0.95
    },
    "total": 20
  },
  "success": true
}
```

### GET `/api/v1/overview/rounds/{id}`

Returns details for a specific round.

**Response:**
```json
{
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
      "topScore": 0.95
    }
  },
  "success": true
}
```

---

## 4. Leaderboard

### GET `/api/v1/overview/leaderboard`

Returns performance comparison data for the leaderboard chart.

**Query Parameters:**
- `timeRange` (string, optional): Time range (`7D`, `15D`, `30D`, `all`)
- `limit` (number, optional): Number of data points
- `offset` (number, optional): Offset for pagination

**Response:**
```json
{
  "data": {
    "leaderboard": [
      {
        "round": 1,
        "subnet36": 0.750,
        "openai_cua": 0.820,
        "anthropic_cua": 0.870,
        "browser_use": 0.800,
        "timestamp": "2024-01-01T00:00:00Z"
      },
      {
        "round": 2,
        "subnet36": 0.760,
        "openai_cua": 0.825,
        "anthropic_cua": 0.875,
        "browser_use": 0.805,
        "timestamp": "2024-01-02T00:00:00Z"
      }
    ],
    "total": 32,
    "timeRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-15T00:00:00Z"
    }
  },
  "success": true
}
```

---

## 5. Subnet Statistics

### GET `/api/v1/overview/statistics`

Returns comprehensive subnet statistics and network health metrics.

**Response:**
```json
{
  "data": {
    "statistics": {
      "totalStake": 5000000,
      "totalEmission": 250000,
      "averageTrust": 0.97,
      "networkUptime": 99.8,
      "activeValidators": 6,
      "registeredMiners": 50,
      "totalTasksCompleted": 150000,
      "averageTaskScore": 0.85,
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  },
  "success": true
}
```

---

## 6. Network Status

### GET `/api/v1/overview/network-status`

Returns real-time network status information.

**Response:**
```json
{
  "data": {
    "status": "healthy",
    "message": "All systems operational",
    "lastChecked": "2024-01-15T10:30:00Z",
    "activeValidators": 6,
    "networkLatency": 45
  },
  "success": true
}
```

**Status Values:**
- `healthy`: All systems operational
- `degraded`: Some issues detected
- `down`: Major issues or outage

---

## 7. Recent Activity

### GET `/api/v1/overview/recent-activity`

Returns recent activity feed for the dashboard.

**Query Parameters:**
- `limit` (number, optional): Number of activities to return (default: 10)

**Response:**
```json
{
  "data": {
    "activities": [
      {
        "id": "activity_1",
        "type": "task_completed",
        "message": "Validator 'Autoppia' completed task #5787",
        "timestamp": "2024-01-15T10:25:00Z",
        "metadata": {
          "validatorId": "autoppia",
          "taskId": "5787",
          "score": 0.95
        }
      },
      {
        "id": "activity_2",
        "type": "round_started",
        "message": "Round 21 started",
        "timestamp": "2024-01-15T10:00:00Z",
        "metadata": {
          "roundId": 21,
          "startBlock": 6527001
        }
      }
    ],
    "total": 25
  },
  "success": true
}
```

**Activity Types:**
- `task_completed`: A task was completed
- `validator_joined`: A new validator joined
- `round_started`: A new round started
- `round_ended`: A round ended
- `miner_registered`: A new miner registered

---

## 8. Performance Trends

### GET `/api/v1/overview/performance-trends`

Returns performance trends data for charts.

**Query Parameters:**
- `days` (number, optional): Number of days to include (default: 7)

**Response:**
```json
{
  "data": {
    "trends": [
      {
        "date": "2024-01-08",
        "averageScore": 0.82,
        "totalTasks": 1200,
        "activeValidators": 6,
        "networkUptime": 99.5
      },
      {
        "date": "2024-01-09",
        "averageScore": 0.84,
        "totalTasks": 1350,
        "activeValidators": 6,
        "networkUptime": 99.7
      }
    ],
    "period": "7 days"
  },
  "success": true
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "data": null,
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Implementation Notes

1. **Caching**: Consider implementing caching for frequently accessed data like metrics and statistics
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Real-time Updates**: Consider WebSocket connections for real-time data updates
4. **Pagination**: All list endpoints should support pagination for large datasets
5. **Filtering**: Implement comprehensive filtering options for better user experience
6. **Error Handling**: Provide detailed error messages for debugging
7. **Data Validation**: Validate all input parameters and return appropriate error messages
8. **Performance**: Optimize database queries and consider indexing for frequently queried fields

---

## Environment Variables

The frontend expects the following environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

This can be configured for different environments (development, staging, production).
