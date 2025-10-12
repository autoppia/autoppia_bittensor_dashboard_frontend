# Rounds API Analysis and Improvement Suggestions

## 📊 **Current Implementation Status**

### ✅ **What We Already Have**

1. **`getRounds()` API Method** ✅
   - **Endpoint**: `GET /api/v1/rounds`
   - **Location**: `apps/isomorphic/src/services/api/rounds.service.ts`
   - **Parameters**: `page`, `limit`, `status`, `sortBy`, `sortOrder`
   - **Response**: `RoundsListResponse` with pagination

2. **`useRoundsList()` Hook** ✅
   - **Location**: `apps/isomorphic/src/services/hooks/useRounds.ts`
   - **Current settings**: `limit: 20, sortBy: 'id', sortOrder: 'desc'`
   - **Returns**: 20 most recent rounds + current round

3. **Rounds Slider Component** ✅
   - **Location**: `apps/isomorphic/src/app/rounds/[id]/round-recents.tsx`
   - **Features**: Scrollable slider with navigation buttons
   - **Styling**: Different styles for current, recent, and past rounds

### 🎯 **Current Rounds Selection Logic**

**How rounds are currently selected:**
```typescript
// In useRoundsList hook
const rounds = useRounds({ 
  limit: 20,           // Show 20 rounds
  sortBy: 'id',        // Sort by round ID
  sortOrder: 'desc'    // Most recent first (highest ID)
});

// In round-recents component
rounds
  .slice()
  .sort((a, b) => b.id - a.id) // Sort by ID descending
  .map((round, index) => {
    const isCurrent = round.current;
    const isFirstRound = index === 0; // First = highest ID
    // Apply different styling based on position and status
  });
```

**Current behavior:**
- Shows **20 most recent rounds** (by ID)
- **Current round** gets yellow styling
- **First round** (highest ID) gets purple styling  
- **Selected round** gets blue styling
- **Past rounds** get gray styling

## 🚀 **Suggested Improvements**

### 1. **Enhanced Rounds Selection Logic**

**Current**: Shows 20 rounds sorted by ID
**Suggested**: More intelligent selection based on different criteria

```typescript
// Option A: Time-based selection
const getRoundsByTimeRange = (days: number = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return useRounds({
    limit: 50,
    sortBy: 'startTime',
    sortOrder: 'desc',
    // Add date filter if backend supports it
  });
};

// Option B: Status-based selection
const getRoundsByStatus = () => {
  return useRounds({
    limit: 20,
    status: 'active', // Only show active rounds
    sortBy: 'startTime',
    sortOrder: 'desc'
  });
};

// Option C: Performance-based selection
const getTopPerformingRounds = () => {
  return useRounds({
    limit: 15,
    sortBy: 'averageScore',
    sortOrder: 'desc'
  });
};
```

### 2. **Additional API Endpoints**

**Current**: Basic rounds list with pagination
**Suggested**: Add specialized endpoints

```typescript
// Add to rounds.service.ts
export class RoundsService {
  // ... existing methods

  /**
   * Get recent rounds (last 30 days)
   */
  async getRecentRounds(days: number = 30): Promise<RoundsListResponse> {
    const response = await apiClient.get<RoundsListResponse>(
      `${this.baseEndpoint}/recent`,
      { days }
    );
    return response.data;
  }

  /**
   * Get rounds by status
   */
  async getRoundsByStatus(status: 'active' | 'completed' | 'pending'): Promise<RoundsListResponse> {
    const response = await apiClient.get<RoundsListResponse>(
      `${this.baseEndpoint}/status/${status}`
    );
    return response.data;
  }

  /**
   * Get top performing rounds
   */
  async getTopPerformingRounds(limit: number = 10): Promise<RoundsListResponse> {
    const response = await apiClient.get<RoundsListResponse>(
      `${this.baseEndpoint}/top-performing`,
      { limit, sortBy: 'averageScore', sortOrder: 'desc' }
    );
    return response.data;
  }

  /**
   * Get rounds with specific criteria
   */
  async getRoundsWithCriteria(criteria: {
    minScore?: number;
    minMiners?: number;
    dateRange?: { start: string; end: string };
    status?: string;
  }): Promise<RoundsListResponse> {
    const response = await apiClient.get<RoundsListResponse>(
      `${this.baseEndpoint}/search`,
      criteria
    );
    return response.data;
  }
}
```

### 3. **Enhanced Hooks**

```typescript
// Add to useRounds.ts
export function useRecentRounds(days: number = 30) {
  return useApiCall(
    () => roundsService.getRecentRounds(days),
    [days]
  );
}

export function useRoundsByStatus(status: 'active' | 'completed' | 'pending') {
  return useApiCall(
    () => roundsService.getRoundsByStatus(status),
    [status]
  );
}

export function useTopPerformingRounds(limit: number = 10) {
  return useApiCall(
    () => roundsService.getTopPerformingRounds(limit),
    [limit]
  );
}

// Enhanced rounds list with more options
export function useRoundsListEnhanced(options: {
  limit?: number;
  sortBy?: 'id' | 'startTime' | 'endTime' | 'averageScore' | 'totalMiners';
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'completed' | 'pending';
  timeRange?: { days: number };
  includeCurrent?: boolean;
}) {
  const { limit = 20, sortBy = 'id', sortOrder = 'desc', status, timeRange, includeCurrent = true } = options;
  
  const rounds = useRounds({ limit, sortBy, sortOrder, status });
  const currentRound = includeCurrent ? useCurrentRound() : { data: null, loading: false, error: null };

  const loading = rounds.loading || currentRound.loading;
  const error = rounds.error || currentRound.error;

  const refetch = useCallback(() => {
    rounds.refetch();
    if (includeCurrent) currentRound.refetch();
  }, [rounds, currentRound, includeCurrent]);

  return {
    data: {
      rounds: rounds.data,
      currentRound: currentRound.data,
    },
    loading,
    error,
    refetch,
  };
}
```

### 4. **Smart Rounds Selection Component**

```typescript
// New component: SmartRoundsSelector.tsx
interface SmartRoundsSelectorProps {
  selectionMode: 'recent' | 'top-performing' | 'active' | 'custom';
  limit?: number;
  customCriteria?: any;
}

export function SmartRoundsSelector({ 
  selectionMode, 
  limit = 20, 
  customCriteria 
}: SmartRoundsSelectorProps) {
  const getRoundsData = () => {
    switch (selectionMode) {
      case 'recent':
        return useRecentRounds(30);
      case 'top-performing':
        return useTopPerformingRounds(limit);
      case 'active':
        return useRoundsByStatus('active');
      case 'custom':
        return useRoundsWithCriteria(customCriteria);
      default:
        return useRoundsList();
    }
  };

  const { data, loading, error } = getRoundsData();
  
  // ... render logic
}
```

### 5. **Backend API Endpoints to Add**

If you're adding backend endpoints, consider these:

```bash
# Current endpoint (already exists)
GET /api/v1/rounds?limit=20&sortBy=id&sortOrder=desc

# Suggested additional endpoints
GET /api/v1/rounds/recent?days=30
GET /api/v1/rounds/status/active
GET /api/v1/rounds/status/completed  
GET /api/v1/rounds/status/pending
GET /api/v1/rounds/top-performing?limit=10
GET /api/v1/rounds/search?minScore=0.8&minMiners=50&dateRange=2024-01-01,2024-01-31
```

## 🎯 **Recommended Implementation**

### **Phase 1: Enhance Current Implementation**
1. **Add more query parameters** to existing `getRounds()` method
2. **Create enhanced hooks** for different selection criteria
3. **Improve rounds slider** with better selection logic

### **Phase 2: Add New Endpoints**
1. **Add specialized endpoints** to backend
2. **Create corresponding service methods**
3. **Add new hooks** for specialized queries

### **Phase 3: Smart Selection**
1. **Create smart selector component**
2. **Add user preferences** for rounds selection
3. **Implement caching** for better performance

## 📋 **Immediate Action Items**

### **For Frontend (You can do now):**
1. ✅ **Current implementation is working** - no immediate changes needed
2. 🔧 **Enhance existing hook** with more options
3. 🔧 **Add better error handling** and loading states
4. 🔧 **Improve rounds slider** with more selection criteria

### **For Backend (If you want to add endpoints):**
1. 🔧 **Add `/api/v1/rounds/recent`** endpoint
2. 🔧 **Add `/api/v1/rounds/status/{status}`** endpoint  
3. 🔧 **Add `/api/v1/rounds/top-performing`** endpoint
4. 🔧 **Add `/api/v1/rounds/search`** endpoint with advanced criteria

## 🎉 **Conclusion**

**Good news**: You already have a working `getRounds()` API method and rounds slider! 

**Current implementation is solid** and provides:
- ✅ 20 most recent rounds
- ✅ Proper sorting and pagination
- ✅ Good UI with different styling for different round types
- ✅ Loading states and error handling

**Optional improvements** you could add:
- 🔧 More selection criteria (time-based, performance-based)
- 🔧 Additional API endpoints for specialized queries
- 🔧 Enhanced hooks with more options
- 🔧 Smart selection logic based on user preferences

The current implementation should work well for most use cases. The suggested improvements are enhancements that could be added if you want more sophisticated rounds selection logic.
