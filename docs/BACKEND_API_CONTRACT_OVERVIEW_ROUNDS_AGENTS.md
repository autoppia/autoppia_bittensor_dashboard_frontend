# Backend API Contract (Overview, Rounds, Agents)

This document captures the backend responses the dashboard frontend (see `apps/isomorphic/src/app`) expects for the **Overview**, **Rounds**, and **Agents** areas. Each subsection lists the React components that consume the data, the endpoints they call, and the shape/semantics of the payloads. Implement these contracts to keep the UI responsive and to avoid error banners rendered by the built‑in loaders.

---

## Overview

### Components and data flow
- `overview/overview-metrics.tsx` → summary cards for top score, websites, validators, miners.
- `overview/overview-miner-chart.tsx` → comparative line chart of subnet vs. SOTA agents.
- `overview/overview-validators.tsx` → validator cards + link into the latest round.
- `layouts/hydrogen/header.tsx` → network status badge in the top navigation.

The `useOverviewData` hook also prefetches subnet statistics, network status, and recent activity so the backend should expose those endpoints even if the current UI only uses a subset.

### Required endpoints

#### GET `/api/v1/overview/metrics`
- **Purpose:** Supply headline metrics.
- **Response (preferred):**
  ```json5
  {
    "data": {
      "metrics": {
        "topScore": 0.95,           // decimal 0-1
        "totalWebsites": 11,
        "totalValidators": 6,
        "totalMiners": 24,
        "currentRound": 42,
        "subnetVersion": "1.0.0",
        "lastUpdated": "2024-03-18T12:34:56Z"
      }
    }
  }
  ```
- **Frontend usage:** Displays `topScore`, `totalWebsites`, `totalValidators`, `totalMiners`; other fields can be surfaced in headers/tooltips later.
- **Notes:** Service tolerates a flat payload (e.g. `{ "metrics": { ... } }`) but wrapping everything under `data.metrics` is recommended.

#### GET `/api/v1/overview/validators`
- **Purpose:** List validators shown on the overview cards.
- **Query params:** `page`, `limit`, `status`, `sortBy`, `sortOrder`.
- **Response:**
  ```json5
  {
    "data": {
      "validators": [
        {
          "id": "validator-hotkey",
          "name": "Validator Alpha",
          "hotkey": "abcd...wxyz",
          "icon": "https://cdn/.../alpha.png",
          "currentTask": "Summarising https://example.com",
          "status": "Sending Tasks",    // Sending Tasks | Evaluating | Waiting | Offline
          "totalTasks": 128,
          "weight": 234567,
          "trust": 0.92,
          "version": 3,
          "lastSeen": "2024-03-18T12:00:00Z",
          "uptime": 99.4,               // percentage 0-100
          "stake": 1200.5,
          "emission": 42.1
        }
      ],
      "total": 42,
      "page": 1,
      "limit": 10
    }
  }
  ```
- **Frontend usage:** Renders avatar (`icon`), name, shortened hotkey, `currentTask`, `status` badge, and secondary stats derived from `weight`, `trust`, `version`.

#### GET `/api/v1/overview/validators/{id}`
- **Purpose:** Retrieve a single validator (detail views use this).
- **Response:** `{ "validator": <ValidatorData> }`.

#### GET `/api/v1/overview/rounds/current`
- **Purpose:** Anchor overview links to the running round.
- **Response:**
  ```json5
  {
    "data": {
      "round": {
        "id": 42,
        "startBlock": 123456,
        "endBlock": 124800,
        "current": true,
        "startTime": "2024-03-18T00:00:00Z",
        "endTime": null,
        "status": "active",              // active | completed | pending
        "totalTasks": 640,
        "completedTasks": 212,
        "averageScore": 0.87,
        "topScore": 0.95
      }
    }
  }
  ```

#### GET `/api/v1/overview/rounds`
- **Purpose:** Feed the “recent rounds” slider on the overview page.
- **Query params:** `page`, `limit`, `status`, `includeCurrent`.
- **Response:** `{ "rounds": [<OverviewRoundData>], "currentRound": <OverviewRoundData>, "total": 120 }`.

#### GET `/api/v1/overview/rounds/{id}`
- **Purpose:** Fetch round metadata on demand (detail pages).
- **Response:** `{ "round": <OverviewRoundData> }` or a flat `<OverviewRoundData>`.

#### GET `/api/v1/overview/leaderboard`
- **Purpose:** Supply round-by-round score evolution vs. SOTA baselines.
- **Query params:** `timeRange` (`'7D' | '15D' | '30D' | 'all'`), optional `limit`, `offset`.
- **Response:**
  ```json5
  {
    "data": {
      "leaderboard": [
        {
          "round": 42,
          "subnet36": 0.95,      // decimal score 0-1
          "openai_cua": 0.87,
          "anthropic_cua": 0.89,
          "browser_use": 0.92,
          "timestamp": "2024-03-18T12:30:00Z"
        }
      ],
      "total": 90,
      "timeRange": {
        "start": "2024-01-18T00:00:00Z",
        "end": "2024-03-18T23:59:59Z"
      }
    }
  }
  ```

#### GET `/api/v1/overview/statistics`
- **Purpose:** Provide aggregate subnet numbers for future cards/tooltips.
- **Response:** `{ "statistics": { "totalStake": 12345.6, "totalEmission": 789.1, "averageTrust": 0.82, "networkUptime": 99.2, "activeValidators": 6, "registeredMiners": 24, "totalTasksCompleted": 3200, "averageTaskScore": 0.88, "lastUpdated": "2024-03-18T12:34:56Z" } }`.

#### GET `/api/v1/overview/network-status`
- **Purpose:** Drive the live status pill in the header.
- **Response:**
  ```json5
  {
    "data": {
      "status": "healthy",         // healthy | degraded | down
      "message": "All validators responsive",
      "lastChecked": "2024-03-18T12:34:56Z",
      "activeValidators": 6,
      "networkLatency": 123        // ms
    }
  }
  ```
- **Frontend usage:** Uses `status` for styling and `activeValidators`/`networkLatency` for tooltips when provided.

#### GET `/api/v1/overview/recent-activity`
- **Purpose:** Activity feeds and notification banners.
- **Query params:** `limit` (default 10).
- **Response:** `{ "activities": [ { "id": "evt_1", "type": "round_started", "message": "...", "timestamp": "2024-03-18T11:00:00Z", "metadata": { "roundId": 42 } } ], "total": 120 }`.

#### GET `/api/v1/overview/performance-trends`
- **Purpose:** Trend visualisation (future charts).
- **Query params:** `days` (default 7).
- **Response:** `{ "trends": [ { "date": "2024-03-12", "averageScore": 0.86, "totalTasks": 540, "activeValidators": 6, "networkUptime": 99.3 } ], "period": "2024-03-12/2024-03-18" }`.

---

## Rounds

### Components and data flow
- `rounds/[id]/page.tsx` & `rounds/[id]/round.tsx` → load round metadata.
- `rounds/[id]/round-recents.tsx` → carousel of recent rounds.
- `rounds/[id]/round-stats.tsx`, `round-result.tsx`, `round-miner-scores.tsx`, `round-top-miners.tsx`, `round-progress.tsx` → detailed metrics, charts, and validator/miner cards.

All hooks reside in `services/hooks/useRounds.ts` and call the service class in `services/api/rounds.service.ts`.

### Required endpoints

#### GET `/api/v1/rounds`
- **Purpose:** Paginated round list (recent rounds slider, admin views).
- **Query params:** `page`, `limit`, `status`, `sortBy` (`id | startTime | endTime | totalTasks | averageScore`), `sortOrder`.
- **Response:**
  ```json5
  {
    "data": {
      "rounds": [<RoundData>],
      "total": 180,
      "page": 1,
      "limit": 20
    }
  }
  ```
- **`RoundData` fields:** `id`, `startBlock`, `endBlock`, `current`, `startTime`, `endTime?`, `status`, `totalTasks`, `completedTasks`, `averageScore`, `topScore`, optional `currentBlock`, `blocksRemaining`, `progress`.

#### GET `/api/v1/rounds/current`
- **Purpose:** Identify the active round.
- **Response:** `{ "data": { "round": <RoundData> } }`.

#### GET `/api/v1/rounds/{id}`
- **Purpose:** Populate the round header (status pill, block range).
- **Response:** `{ "data": { "round": <RoundData> } }`.

#### GET `/api/v1/rounds/{id}/statistics`
- **Purpose:** Aggregate metrics shown in `round-stats.tsx`.
- **Response:**
  ```json5
  {
    "data": {
      "statistics": {
        "roundId": 42,
        "totalMiners": 120,
        "activeMiners": 98,
        "totalTasks": 640,
        "completedTasks": 512,
        "averageScore": 0.86,
        "topScore": 0.95,
        "successRate": 0.82,
        "averageDuration": 28.4,      // seconds
        "totalStake": 15234.5,
        "totalEmission": 834.2,
        "lastUpdated": "2024-03-18T12:30:00Z"
      }
    }
  }
  ```

#### GET `/api/v1/rounds/{id}/miners`
- **Purpose:** Feed the miner scores bar chart.
- **Query params:** `page`, `limit`, `sortBy` (`score | duration | ranking | uid`), `sortOrder`, `success`, `minScore`, `maxScore`.
- **Response:**
  ```json5
  {
    "data": {
      "miners": [
        {
          "uid": 12,
          "hotkey": "abcd...7890",
          "success": true,
          "score": 0.94,          // decimal 0-1
          "duration": 176,        // seconds
          "ranking": 1,
          "tasksCompleted": 28,
          "tasksTotal": 30,
          "stake": 500.2,
          "emission": 12.4,
          "lastSeen": "2024-03-18T11:58:00Z",
          "validatorId": "validator-hotkey"
        }
      ],
      "total": 220,
      "page": 1,
      "limit": 25
    }
  }
  ```

#### GET `/api/v1/rounds/{id}/validators`
- **Purpose:** Populate the validator carousel and winner cards.
- **Response:** `{ "data": { "validators": [ <ValidatorPerformance> ], "total": 6 } }`.
- **`ValidatorPerformance` fields:** `id`, `name`, `hotkey`, `icon`, `status` (`active | inactive | offline`), `totalTasks`, `completedTasks`, `averageScore`, `weight`, `trust`, `version`, `stake`, `emission`, `lastSeen`, `uptime`.

#### GET `/api/v1/rounds/{id}/activity`
- **Purpose:** Recent events list (future feed, error handling already present).
- **Query params:** `limit`, `offset`, `type`, `since`.
- **Response:** `{ "data": { "activities": [ { "id": "evt_1", "type": "task_completed", "message": "...", "timestamp": "2024-03-18T11:44:00Z", "metadata": { "minerUid": 12, "score": 0.92 } } ], "total": 60 } }`.

#### GET `/api/v1/rounds/{id}/progress`
- **Purpose:** Progress bar with block counts and ETA.
- **Response:**
  ```json5
  {
    "data": {
      "progress": {
        "roundId": 42,
        "currentBlock": 123980,
        "startBlock": 123456,
        "endBlock": 124800,
        "blocksRemaining": 820,
        "progress": 0.36,              // 0-1 float
        "estimatedTimeRemaining": {
          "days": 0,
          "hours": 5,
          "minutes": 22,
          "seconds": 14
        },
        "lastUpdated": "2024-03-18T12:40:00Z"
      }
    }
  }
  ```

#### GET `/api/v1/rounds/{id}/miners/top`
- **Purpose:** Sidebar list linking to agent detail pages.
- **Query params:** `limit` (default 10). Service forces `sortBy=score`, `sortOrder=desc`.
- **Response:** `{ "data": { "miners": [<MinerPerformance>], "total": 10 } }` or a flat `[<MinerPerformance>]`.

#### GET `/api/v1/rounds/{id}/miners/{uid}`
- **Purpose:** Detailed miner run breakdowns (future drilldowns, keeps hook happy).
- **Response:** `{ "data": { "miner": <MinerPerformance> } }`.

#### GET `/api/v1/rounds/{id}/validators/{validatorId}`
- **Purpose:** Deep validator analytics per round (hook already in place).
- **Response:** `{ "data": { "validator": <ValidatorPerformance> } }`.

#### POST `/api/v1/rounds/compare`
- **Purpose:** Multi-round comparison. Request body `{ "roundIds": [41, 42, 43] }`.
- **Response:** `{ "data": { "rounds": [ { "roundId": 42, "statistics": <RoundStatistics>, "topMiners": [<MinerPerformance>] } ] } }`.

#### GET `/api/v1/rounds/{id}/timeline`
- **Purpose:** Time-series charting of round progression.
- **Response:** `{ "data": { "timeline": [ { "timestamp": "2024-03-18T12:00:00Z", "block": 123600, "completedTasks": 240, "averageScore": 0.88, "activeMiners": 92 } ] } }`.

#### GET `/api/v1/rounds/{id}/summary`
- **Purpose:** Quick glance stats for cards and notifications.
- **Response:** `{ "data": { "roundId": 42, "status": "active", "progress": 0.36, "totalMiners": 120, "averageScore": 0.86, "topScore": 0.95, "timeRemaining": "PT5H22M" } }`.

---

## Agents

### Components and data flow
- `agents/page.tsx` → loads the minimal miner list and redirects to the top performer.
- `agents/[id]/agent.tsx` → orchestrates the agent detail page.
- `agents/[id]/agent-stats.tsx` → rolling stat cards.
- `agents/[id]/agent-score-chart.tsx` → score vs. round chart (uses round-level score history).
- `agents/[id]/agent-score-analytics.tsx` → highlights current score and top score.
- `agents/[id]/agent-validators.tsx` → per-validator run cards and aggregated averages.

Hooks live in `services/hooks/useAgents.ts` and call `services/api/agents.service.ts`.

### Required endpoints

#### GET `/api/v1/miner-list`
- **Purpose:** Lightweight list for the sidebar and initial redirect.
- **Query params:** `page`, `limit`, `isSota`, `search`.
- **Response:**
  ```json5
  {
    "miners": [
      {
        "uid": 12,
        "name": "Agent Phoenix",
        "ranking": 1,
        "score": 95.4,         // percentage 0-100
        "isSota": false,
        "imageUrl": "https://cdn/.../phoenix.png"
      }
    ],
    "total": 120,
    "page": 1,
    "limit": 100
  }
  ```
- **Frontend usage:** `agents/page.tsx` searches for `ranking === 1` to redirect to `/agents/{uid}`.

#### GET `/api/v1/agents/{uid}`
- **Purpose:** Core agent profile data.
- **Response:**
  ```json5
  {
    "data": {
      "agent": {
        "id": "12",
        "uid": 12,
        "name": "Agent Phoenix",
        "hotkey": "abcd...1234",
        "type": "autoppia",
        "imageUrl": "https://cdn/.../phoenix.png",
        "githubUrl": "https://github.com/autoppia/phoenix",
        "taostatsUrl": "https://taostats.io/miner/12",
        "isSota": false,
        "status": "active",                   // active | inactive | maintenance
        "description": "Autonomous web agent",
        "version": "v1.3.0",
        "totalRuns": 84,
        "successfulRuns": 72,
        "currentScore": 95.4,                 // percentage 0-100
        "currentTopScore": 98.1,              // percentage 0-100
        "currentRank": 1,
        "bestRankEver": 1,
        "roundsParticipated": 30,
        "alphaWonInPrizes": 42.5,
        "averageDuration": 32.5,              // seconds
        "totalTasks": 480,
        "completedTasks": 456,
        "lastSeen": "2024-03-18T12:20:00Z",
        "createdAt": "2023-11-01T09:00:00Z",
        "updatedAt": "2024-03-18T12:20:00Z"
      },
      "scoreRoundData": [
        {
          "round_id": 42,
          "score": 95.1,           // percentage 0-100
          "rank": 1,
          "reward": 12.5,
          "timestamp": "2024-03-18T12:00:00Z"
        }
      ]
    }
  }
  ```
- **Frontend usage:** Everything in `agent.tsx`, `agent-score-chart.tsx`, and header badges relies on these fields. The chart converts `scoreRoundData[].score` from percentage to decimal by dividing by 100.

#### GET `/api/v1/miners/{uid}/performance`
- **Purpose:** High-resolution performance trend used when available; otherwise the service generates fallback data.
- **Query params:** `timeRange` (`'7d' | '30d' | '90d'`), `granularity` (`'hour' | 'day'`).
- **Response (lightweight trend):**
  ```json5
  {
    "success": true,
    "data": {
      "performanceTrend": [
        {
          "period": "2024-03-18T12:00:00Z",
          "score": 0.94,         // decimal 0-1
          "successRate": 0.9,
          "duration": 28.5       // seconds
        }
      ]
    }
  }
  ```
- **Frontend usage:** Transformed into `performanceTrend` for the chart when real data exists. Returning at least two points avoids the “Insufficient data” message.

#### GET `/api/v1/agents/{id}/performance`
- **Purpose:** General-purpose metrics summary (`agent-stats.tsx` uses it).
- **Query params:** `timeRange`, `startDate`, `endDate`, `granularity`.
- **Response:**
  ```json5
  {
    "data": {
      "metrics": {
        "agentId": "12",
        "timeRange": { "start": "2024-03-12", "end": "2024-03-18" },
        "totalRuns": 14,
        "successfulRuns": 12,
        "failedRuns": 2,
        "currentScore": 95.4,          // percentage 0-100
        "currentTopScore": 98.1,       // percentage 0-100
        "worstScore": 72.0,
        "averageDuration": 31.2,       // seconds
        "totalTasks": 96,
        "completedTasks": 92,
        "taskCompletionRate": 0.96,
        "scoreDistribution": {
          "excellent": 6,
          "good": 5,
          "average": 2,
          "poor": 1
        },
        "performanceTrend": [
          { "round": 42, "score": 0.95 },
          { "round": 41, "score": 0.92 }
        ]
      }
    }
  }
  ```

#### GET `/api/v1/agents/{id}/runs`
- **Purpose:** Validator run breakdown (`agent-validators.tsx`).
- **Query params:** `page`, `limit`, `roundId`, `validatorId`, `status`, `sortBy`, `sortOrder`, `startDate`, `endDate`.
- **Response:**
  ```json5
  {
    "data": {
      "runs": [
        {
          "runId": "run_abc123",
          "agentId": "12",
          "roundId": 42,
          "validatorId": "validator-hotkey",
          "startTime": "2024-03-18T10:00:00Z",
          "endTime": "2024-03-18T10:25:00Z",
          "status": "completed",          // running | completed | failed | timeout
          "totalTasks": 8,
          "completedTasks": 8,
          "score": 0.94,                   // decimal 0-1
          "duration": 1500,                // seconds
          "ranking": 1,
          "tasks": [
            {
              "taskId": "task-1",
              "website": "https://example.com",
              "useCase": "Data extraction",
              "status": "completed",
              "score": 0.96,
              "duration": 180,
              "startTime": "2024-03-18T10:00:00Z",
              "endTime": "2024-03-18T10:03:00Z",
              "error": null
            }
          ],
          "metadata": {
            "environment": "docker",
            "version": "v1.3.0",
            "resources": { "cpu": 2, "memory": 4096, "storage": 20 }
          }
        }
      ],
      "total": 36,
      "page": 1,
      "limit": 50
    }
  }
  ```
- **Frontend usage:** Calculates per-validator averages (`score`, `duration`, `completedTasks`, `ranking`) and builds cards linking to `/agent-run/{runId}`.

#### GET `/api/v1/agents/statistics`
- **Purpose:** Global stats used in the side analytics card.
- **Response:**
  ```json5
  {
    "data": {
      "statistics": {
        "totalAgents": 120,
        "activeAgents": 110,
        "inactiveAgents": 10,
        "totalRuns": 4200,
        "successfulRuns": 3800,
        "averageCurrentScore": 88.4,   // percentage 0-100
        "topPerformingAgent": { "id": "12", "name": "Agent Phoenix", "score": 95.4 },
        "mostActiveAgent": { "id": "7", "name": "Agent Atlas", "runs": 220 },
        "performanceDistribution": { "excellent": 18, "good": 52, "average": 40, "poor": 10 },
        "lastUpdated": "2024-03-18T12:00:00Z"
      }
    }
  }
  ```

#### Additional helper endpoints
- **GET `/api/v1/agents`** — full list with pagination/filters (used indirectly by helper methods like `getTopAgents` / `getMostActiveAgents`).
- **GET `/api/v1/agents/{id}/activity`** — optional activity feed (hook ready in `useAgentActivity`).
- **POST `/api/v1/agents/compare`** — compare agents by metrics (`agentComparison` hook).

---

## Error handling expectations
- All services throw when `response.data` is missing or malformed. Return descriptive error messages (e.g. `{ "error": "Unable to reach validator service" }`) so users see actionable copy in the toast/error cards.
- HTTP 4xx/5xx codes should be used for real errors; the frontend converts thrown messages into inline alerts.
- Loading states are already handled on the frontend—return empty arrays with accurate totals (`0`) instead of `null` to avoid extra guards.

Implementing these endpoints with the documented shapes will ensure the Overview, Rounds, and Agents sections render without relying on placeholder/fallback data.
