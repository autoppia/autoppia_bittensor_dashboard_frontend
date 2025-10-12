# Backend API Implementation Instructions

## 🚨 **URGENT: Frontend is using mock data because backend API is not responding**

The frontend dashboard is currently falling back to static mock data because the rounds API endpoints are not implemented or not responding. This needs to be fixed immediately.

## 📋 **Required API Endpoints**

### Base Configuration
- **Base URL**: `http://localhost:8000/api/v1/rounds`
- **Content-Type**: `application/json`
- **Accept**: `application/json`

## 🔧 **Critical Endpoints to Implement**

### 1. **GET `/api/v1/rounds/current`** - Current Round
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

### 2. **GET `/api/v1/rounds/{id}`** - Specific Round Details
```json
{
  "success": true,
  "data": {
    "round": {
      "id": 18,
      "startBlock": 6525001,
      "endBlock": 6526000,
      "current": false,
      "startTime": "2024-01-14T08:00:00Z",
      "endTime": "2024-01-15T08:00:00Z",
      "status": "completed",
      "totalTasks": 1000,
      "completedTasks": 1000,
      "averageScore": 0.82,
      "topScore": 0.94,
      "currentBlock": 6526000,
      "blocksRemaining": 0,
      "progress": 1.0
    }
  },
  "error": null,
  "code": null
}
```

### 3. **GET `/api/v1/rounds/{id}/statistics`** - Round Statistics
```json
{
  "success": true,
  "data": {
    "statistics": {
      "roundId": 18,
      "totalMiners": 156,
      "activeMiners": 142,
      "totalTasks": 1000,
      "completedTasks": 1000,
      "averageScore": 0.82,
      "topScore": 0.94,
      "successRate": 0.95,
      "averageDuration": 28.5,
      "totalStake": 5200000,
      "totalEmission": 260000,
      "lastUpdated": "2024-01-15T08:00:00Z"
    }
  },
  "error": null,
  "code": null
}
```

### 4. **GET `/api/v1/rounds/{id}/miners`** - Round Miners
```json
{
  "success": true,
  "data": {
    "miners": [
      {
        "uid": 25,
        "hotkey": "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
        "score": 0.94,
        "ranking": 1,
        "duration": 25.3,
        "tasksCompleted": 100,
        "successRate": 0.98
      },
      {
        "uid": 84,
        "hotkey": "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
        "score": 0.92,
        "ranking": 2,
        "duration": 28.1,
        "tasksCompleted": 98,
        "successRate": 0.96
      }
    ],
    "total": 156,
    "page": 1,
    "limit": 25
  },
  "error": null,
  "code": null
}
```

### 5. **GET `/api/v1/rounds/{id}/miners/top`** - Top Miners
```json
{
  "success": true,
  "data": {
    "miners": [
      {
        "uid": 25,
        "hotkey": "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
        "score": 0.94,
        "ranking": 1,
        "duration": 25.3,
        "tasksCompleted": 100,
        "successRate": 0.98
      },
      {
        "uid": 84,
        "hotkey": "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
        "score": 0.92,
        "ranking": 2,
        "duration": 28.1,
        "tasksCompleted": 98,
        "successRate": 0.96
      }
    ]
  },
  "error": null,
  "code": null
}
```

### 6. **GET `/api/v1/rounds/{id}/validators`** - Round Validators
```json
{
  "success": true,
  "data": {
    "validators": [
      {
        "id": "autoppia",
        "name": "Autoppia",
        "hotkey": "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
        "version": 7,
        "stake": 1000000,
        "emission": 50000,
        "performance": 0.95,
        "uptime": 0.99
      },
      {
        "id": "tao5",
        "name": "tao5",
        "hotkey": "5G1NjW9YhXLadMWajvTkfcJy6up3yH2q1YzMXDTi6ijanChe",
        "version": 7,
        "stake": 800000,
        "emission": 40000,
        "performance": 0.92,
        "uptime": 0.98
      }
    ]
  },
  "error": null,
  "code": null
}
```

### 7. **GET `/api/v1/rounds/{id}/activity`** - Round Activity
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "act_001",
        "timestamp": "2024-01-15T07:45:00Z",
        "type": "miner_joined",
        "minerUid": 25,
        "message": "Miner 25 joined the round",
        "block": 6525995
      },
      {
        "id": "act_002",
        "timestamp": "2024-01-15T07:30:00Z",
        "type": "task_completed",
        "minerUid": 84,
        "message": "Miner 84 completed task batch",
        "block": 6525990
      }
    ]
  },
  "error": null,
  "code": null
}
```

### 8. **GET `/api/v1/rounds/{id}/progress`** - Round Progress
```json
{
  "success": true,
  "data": {
    "progress": {
      "currentBlock": 6526300,
      "totalBlocks": 6527000,
      "progress": 0.75,
      "blocksRemaining": 700,
      "estimatedTimeRemaining": {
        "days": 0,
        "hours": 2,
        "minutes": 30,
        "seconds": 45
      },
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  },
  "error": null,
  "code": null
}
```

## 🚀 **Implementation Priority**

### **Phase 1 (CRITICAL - Do First)**
1. `/api/v1/rounds/current` - Current round data
2. `/api/v1/rounds/{id}` - Specific round details
3. `/api/v1/rounds/{id}/statistics` - Round statistics

### **Phase 2 (HIGH PRIORITY)**
4. `/api/v1/rounds/{id}/miners` - Miners list
5. `/api/v1/rounds/{id}/miners/top` - Top miners
6. `/api/v1/rounds/{id}/validators` - Validators list

### **Phase 3 (MEDIUM PRIORITY)**
7. `/api/v1/rounds/{id}/activity` - Activity feed
8. `/api/v1/rounds/{id}/progress` - Progress tracking

## 🧪 **Testing Instructions**

After implementing each endpoint, test with:

```bash
# Test current round
curl http://localhost:8000/api/v1/rounds/current

# Test specific round (replace 18 with actual round ID)
curl http://localhost:8000/api/v1/rounds/18

# Test round statistics
curl http://localhost:8000/api/v1/rounds/18/statistics

# Test miners
curl http://localhost:8000/api/v1/rounds/18/miners

# Test top miners
curl http://localhost:8000/api/v1/rounds/18/miners/top

# Test validators
curl http://localhost:8000/api/v1/rounds/18/validators

# Test activity
curl http://localhost:8000/api/v1/rounds/18/activity

# Test progress
curl http://localhost:8000/api/v1/rounds/18/progress
```

## ⚠️ **Important Notes**

1. **Response Format**: All responses MUST follow the exact JSON structure shown above
2. **Error Handling**: Return proper HTTP status codes (200 for success, 404 for not found, 500 for server errors)
3. **CORS**: Ensure CORS is configured to allow requests from `http://localhost:3000`
4. **Performance**: These endpoints will be called frequently, optimize for speed
5. **Data Validation**: Validate all input parameters (round IDs, limits, etc.)

## 🔍 **Frontend Integration**

The frontend is already configured to:
- ✅ Make requests to these exact endpoints
- ✅ Handle the response format
- ✅ Fall back to mock data if API fails
- ✅ Cache responses for 30 seconds
- ✅ Display loading states and error messages

## 📞 **Support**

Once you implement these endpoints, the frontend will automatically:
1. Stop using mock data
2. Start displaying real dynamic data
3. Show live updates as the data changes
4. Provide much better performance

**The frontend is ready - we just need the backend API endpoints implemented!**
