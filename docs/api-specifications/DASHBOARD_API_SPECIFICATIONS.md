# Dashboard API Specifications

This document consolidates the backend requirements for the primary dashboard surfaces:

- **Overview**
- **Rounds**
- **Agents**
- **Agent Runs**
- **Tasks**

It is organised by product surface so backend engineers can implement the endpoints the frontend relies on. All endpoints below are authenticated (`Authorization: Bearer <token>` or equivalent) and are versioned under `/api/v1`.

---

## 1. Overview

Base URL: `/api/v1/overview`

### 1.1 Get Global Metrics
- **GET** `/metrics`
- **Description:** Aggregate KPIs rendered on the Overview landing (top score, websites, validators, miners, etc.).
- **Response:**
```json
{
  "data": {
    "metrics": {
      "topScore": 0.94,
      "totalWebsites": 12,
      "activeValidators": 18,
      "activeMiners": 142,
      "completedTasks24h": 1840,
      "averageScore24h": 0.78,
      "networkHealth": "healthy",
      "uptime": 99.2,
      "throughput": 420,
      "lastUpdated": "2024-05-17T18:02:11Z"
    }
  }
}
```

### 1.2 List Validators
- **GET** `/validators`
- **Query Params (optional):**
  - `page`, `limit`
  - `search` (validator name / id)
  - `sortBy` (`score`, `uptime`, `tasksCompleted`)
  - `sortOrder` (`asc`, `desc`)
- **Response:** paginated array of validator cards used across Overview and Validators tabs.

### 1.3 Get Validator Detail
- **GET** `/validators/{validatorId}`
- **Response:**
```json
{
  "validator": {
    "id": "autoppia",
    "name": "AutoPPIA",
    "score": 0.91,
    "uptime": 99.4,
    "image": "/validators/Autoppia.png",
    "description": "AutoPPIA Validator",
    "links": {
      "website": "https://autoppia.com",
      "github": "https://github.com/autoppia"
    },
    "stats": {
      "activeMiners": 28,
      "tasksCompleted": 1543,
      "averageLatency": 820,
      "successRate": 82
    }
  }
}
```

### 1.4 Current Round Snapshot
- **GET** `/rounds/current`
- **Response:** `{ "data": { "round": OverviewRoundData } }` describing round id, status, start/end, leaderboard snippets.

### 1.5 List Recent Rounds
- **GET** `/rounds`
- **Query Params:** `page`, `limit`, `status`, `sortBy` (`startTime`, `score`)
- **Response:** `RoundsResponse` (array of `OverviewRoundData` + pagination metadata).

### 1.6 Leaderboard Snapshot
- **GET** `/leaderboard`
- **Query Params:** `metric` (`score`, `successRate`), `window` (`24h`, `7d`, `30d`), `limit`
- **Response:** `LeaderboardResponse` with top validators, miners, and agents.

### 1.7 Subnet Statistics
- **GET** `/statistics`
- **Response:** `SubnetStatistics` including throughput, uptime, validator distribution, etc.

### 1.8 Network Status
- **GET** `/network-status`
- **Response:**
```json
{
  "data": {
    "status": "healthy",
    "message": "All systems operational",
    "lastChecked": "2024-05-17T18:05:00Z",
    "activeValidators": 18,
    "networkLatency": 812
  }
}
```

### 1.9 Recent Activity Feed
- **GET** `/recent-activity`
- **Query Params:** `limit` (default 10)
- **Response:** activity list (task completed, validator joined, etc.) with timestamps and metadata.

### 1.10 Performance Trends
- **GET** `/performance-trends`
- **Query Params:** `days` (default 7)
- **Response:** time series for average score, total tasks, active validators, network uptime.

---

## 2. Rounds

Base URL: `/api/v1/rounds`

These endpoints power the Rounds page (list + round detail tabs + charts).

### 2.1 List Rounds
- **GET** `/`
- **Query Params:** `page`, `limit`, `status`, `validatorId`, `sortBy`, `sortOrder`
- **Response:** `RoundsListResponse`

### 2.2 Get Round
- **GET** `/{roundId}`
- **Response:** `RoundDetailsResponse` (`data.round`)

### 2.3 Current Round
- **GET** `/current`
- **Response:** `RoundDetailsResponse`

### 2.4 Round Statistics
- **GET** `/{roundId}/statistics`
- **Response:** `RoundStatisticsResponse` (`data.statistics`)

### 2.5 Round Miners
- **GET** `/{roundId}/miners`
- **Query Params:** `page`, `limit`, `sortBy`, `sortOrder`, `website`
- **Response:** `RoundMinersResponse` with paginated `miner` entries (score, success, tasks, etc.)

### 2.6 Round Validators
- **GET** `/{roundId}/validators`
- **Response:** `RoundValidatorsResponse` (`data.validators`)

### 2.7 Round Activity
- **GET** `/{roundId}/activity`
- **Query Params:** `page`, `limit`, `type`, `startDate`, `endDate`
- **Response:** `RoundActivityResponse` (`data.activities`)

### 2.8 Round Progress
- **GET** `/{roundId}/progress`
- **Response:** `RoundProgressResponse` (`data.progress`)

### 2.9 Top Miners
- **GET** `/{roundId}/miners/top`
- **Query Params:** `limit`, `sortBy`, `sortOrder`

### 2.10 Miner Performance in Round
- **GET** `/{roundId}/miners/{minerUid}`
- **Response:** `{ "data": { "miner": MinerPerformance } }`

### 2.11 Validator Performance in Round
- **GET** `/{roundId}/validators/{validatorId}`
- **Response:** `{ "data": { "validator": ValidatorPerformance } }`

### 2.12 Round Comparison
- **POST** `/compare`
- **Body:** `{ "roundIds": [21, 20, 19] }`
- **Response:** per-round statistics & top miners across the requested ids.

### 2.13 Round Timeline
- **GET** `/{roundId}/timeline`
- **Response:** `data.timeline[]` (timestamp, block, completedTasks, averageScore, activeMiners).

### 2.14 Round Summary
- **GET** `/{roundId}/summary`
- **Response:** quick stats for header badges (progress %, avg score, top score, time remaining).

---

## 3. Agents

Base URLs:
- `/api/v1/miner-list` (lightweight list)
- `/api/v1/agents`
- `/api/v1/miners` (performance fallback endpoint)

### 3.1 Minimal Miner List
- **GET** `/api/v1/miner-list`
- **Query Params:** `limit`, `offset`, `search`, `sortBy`
- **Response:** `MinimalAgentsListResponse` (used in sidebar selectors).

### 3.2 Miner Detail (by UID)
- **GET** `/api/v1/agents/{uid}`
- **Response:** `AgentDetailsResponse` (`data.agent`, `data.scoreRoundData`)

### 3.3 Miner Performance
- **GET** `/api/v1/miners/{uid}/performance`
- **Query Params:** `timeRange` (`7d`, `30d`, `90d`), `granularity` (`hour`, `day`)
- **Response:** `{ "success": true, "data": { "performanceTrend": [...] } }`
- **Fallback:** If backend unavailable the frontend synthesises trend data; server should aim to return real metrics (scores, successRate, duration per period).

### 3.4 Agents List (legacy/full)
- **GET** `/api/v1/agents`
- **Query Params:** `page`, `limit`, `search`, `type`, `status`, `sortBy`, `sortOrder`
- **Response:** `AgentsListResponse`

### 3.5 Agent Detail
- **GET** `/api/v1/agents/{agentId}`
- **Response:** same as 3.2 but keyed by agent string id.

### 3.6 Agent Performance Metrics
- **GET** `/api/v1/agents/{agentId}/performance`
- **Query Params:** `timeRange`, `granularity`
- **Response:** `AgentPerformanceResponse` (`data.metrics`)

### 3.7 Agent Runs
- **GET** `/api/v1/agents/{agentId}/runs`
- **Query Params:** `page`, `limit`, `roundId`, `status`, `sortBy`, `sortOrder`
- **Response:** `AgentRunsResponse` (paginated run summaries)

### 3.8 Agent Run Detail
- **GET** `/api/v1/agents/{agentId}/runs/{runId}`
- **Response:** `AgentRunDetailsResponse` (`data.run`)

### 3.9 Agent Activity
- **GET** `/api/v1/agents/{agentId}/activity`
- **Query Params:** `limit`, `type`, `startDate`, `endDate`
- **Response:** `AgentActivityResponse`

### 3.10 Global Agent Activity
- **GET** `/api/v1/agents/activity`
- **Response:** aggregated activity feed across all agents.

### 3.11 Compare Agents
- **POST** `/api/v1/agents/compare`
- **Body:** `{ "agentIds": ["agent-42", "agent-108"], "metrics": ["score","successRate"] }`
- **Response:** `AgentComparisonResponse` (`data.comparison`)

### 3.12 Agent Statistics
- **GET** `/api/v1/agents/statistics`
- **Response:** `AgentStatisticsResponse` (`data.statistics`) with totals, averages, distribution.

---

## 4. Agent Runs

Base URL: `/api/v1/agent-runs`

### 4.1 Search / List Agent Runs
- **GET** `/`
- **Query Params:** `query`, `page`, `limit`, `roundId`, `validatorId`, `agentId`, `status`, `sortBy`, `sortOrder`, `startDate`, `endDate`
- **Response:**
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
      "validators": [{ "id": "autoppia", "name": "AutoPPIA", "count": 132 }],
      "rounds": [{ "id": 21, "count": 65 }],
      "agents": [{ "id": "agent-42", "name": "AutoPPIA Agent", "count": 32 }],
      "statuses": [{ "name": "completed", "count": 372 }]
    }
  }
}
```

### 4.2 Run Detail
- **GET** `/api/v1/agent-runs/{runId}`
- **Query Params:** `includeTasks`, `includeStats`, `includeSummary`, `includePersonas`
- **Response:** `AgentRunDetailsResponse` (`data.run`)

### 4.3 Personas
- **GET** `/api/v1/agent-runs/{runId}/personas`
- **Response:** `AgentRunPersonasResponse`

### 4.4 Statistics
- **GET** `/api/v1/agent-runs/{runId}/stats`
- **Response:** `AgentRunStatsResponse`

### 4.5 Summary
- **GET** `/api/v1/agent-runs/{runId}/summary`
- **Response:** `AgentRunSummaryResponse`

### 4.6 Tasks Summary
- **GET** `/api/v1/agent-runs/{runId}/tasks`
- **Query Params:** `page`, `limit`, `website`, `useCase`, `status`, `sortBy`, `sortOrder`
- **Response:** paginated list of task stubs belonging to the run.

### 4.7 Logs
- **GET** `/api/v1/agent-runs/{runId}/logs`
- **Query Params:** `level`, `limit`, `offset`

### 4.8 Metrics
- **GET** `/api/v1/agent-runs/{runId}/metrics`
- **Response:** CPU, memory, network usage time series + duration aggregates.

### 4.9 Timeline
- **GET** `/api/v1/agent-runs/{runId}/timeline`
- **Response:** chronological events indicating run/task state changes.

### 4.10 Compare Runs
- **POST** `/api/v1/agent-runs/compare`
- **Body:** `{ "runIds": ["b8l3-0n5y","c9r1-6s7t"] }`
- **Response:** aggregated comparison stats.

---

## 5. Tasks

Base URL: `/api/v1/tasks`

### 5.1 Search Tasks
- **GET** `/search`
- **Query Params:** `query`, `website`, `useCase`, `status`, `agentRunId`, `minScore`, `maxScore`, `startDate`, `endDate`, `page`, `limit`, `sortBy`, `sortOrder`
- **Response:**
```json
{
  "data": {
    "tasks": [
      {
        "taskId": "3413",
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
        "updatedAt": "2024-03-15T18:03:11Z"
      }
    ],
    "total": 512,
    "page": 1,
    "limit": 50,
    "facets": {
      "websites": [{ "name": "autodining", "count": 32 }],
      "useCases": [{ "name": "book_reservation", "count": 15 }],
      "statuses": [{ "name": "completed", "count": 372 }],
      "scoreRanges": [{ "range": "0.6-0.8", "count": 180 }]
    }
  }
}
```

### 5.2 List Tasks
- **GET** `/`
- **Query Params:** `page`, `limit`, `agentRunId`, `website`, `useCase`, `status`, `sortBy` (`startTime`, `score`, `duration`, `createdAt`), `sortOrder`
- **Response:** `TasksListResponse`

### 5.3 Task Detail (summary)
- **GET** `/{taskId}`
- **Query Params:** `includeActions`, `includeScreenshots`, `includeLogs`, `includeMetadata`
- **Response:** `TaskDetailsResponse` (`data.task`)

### 5.4 Task Detail (extended view payload)
- **GET** `/{taskId}/details`
- **Query Params:** `includeActions`, `includeScreenshots`, `includeLogs`, `includePerformance`, `includeMetadata`
- **Response:** `TaskDetails` object (prompt, performance, artefacts) as documented in `docs/api-specifications/TASKS_API_SPECIFICATIONS.md`.

### 5.5 Task Results
- **GET** `/{taskId}/results`
- **Response:** `TaskResultsResponse` (`data.results`)

### 5.6 Task Personas
- **GET** `/{taskId}/personas`
- **Response:** `TaskPersonasResponse`

### 5.7 Task Statistics
- **GET** `/{taskId}/statistics`
- **Response:** `TaskStatisticsResponse`

### 5.8 Task Actions
- **GET** `/{taskId}/actions`
- **Query Params:** `page`, `limit`, `type`, `sortBy`, `sortOrder`
- **Response:** action list with pagination metadata.

### 5.9 Task Screenshots
- **GET** `/{taskId}/screenshots`
- **Response:** array of screenshot records (id, url, timestamp, actionId).

### 5.10 Task Logs
- **GET** `/{taskId}/logs`
- **Query Params:** `level`, `limit`, `offset`

### 5.11 Task Metrics
- **GET** `/{taskId}/metrics`
- **Response:** aggregated runtime metrics (durations, CPU, memory, navigations).

### 5.12 Task Timeline
- **GET** `/{taskId}/timeline`
- **Response:** ordered steps with timestamp, action, duration, success flag.

### 5.13 Compare Tasks
- **POST** `/compare`
- **Body:** `{ "taskIds": ["3413","3420","3427"] }`
- **Response:** comparison summary (bestScore, fastest, mostActions, bestSuccessRate).

### 5.14 Task Analytics
- **GET** `/analytics`
- **Query Params:** `timeRange`, `website`, `useCase`, `agentRunId`
- **Response:** aggregated analytics (totals, averages, breakdown by website/useCase, trend over time).

---

## 6. Response Shape References

- **Overview types:** `apps/isomorphic/src/services/api/types/overview.ts`
- **Rounds types:** `apps/isomorphic/src/services/api/types/rounds.ts`
- **Agents types:** `apps/isomorphic/src/services/api/types/agents.ts`
- **Agent Runs types:** `apps/isomorphic/src/services/api/types/agent-runs.ts`
- **Tasks types:** `apps/isomorphic/src/services/api/types/tasks.ts`

These TypeScript definitions in the repo represent the contracts the frontend expects. Backend implementations should align with these shapes to avoid breaking the UI.

---

## 7. General Notes

- All endpoints return JSON with a top-level `data` property unless otherwise stated.
- Pagination responses consistently include `total`, `page`, and `limit`.
- Where optional include flags are supported (e.g., task details, agent runs), omitting sections should either remove the key or return `null`.
- Timestamp fields are ISO 8601 strings (`UTC`).
- Scores are decimal fractions (0–1); when displaying percentages the frontend multiplies by 100.

By implementing the endpoints above, backend engineers will support every data dependency for the Overview, Rounds, Agents, Agent Run (search + detail), and Tasks (search + detail) experiences.
