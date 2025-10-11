# 🔍 API Integration Debug Guide

## Quick Status Check

To test if the overview API integration is working:

### 1. **Check Backend Status**
```bash
# Test if your backend is running
curl http://localhost:8000/api/v1/overview/metrics
```

**Expected Response:**
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

### 2. **Test Frontend Integration**
1. Start the frontend: `pnpm dev`
2. Visit: `http://localhost:3000/api-test`
3. Click "Test All Endpoints"
4. Check results for each endpoint

### 3. **Check Environment Configuration**
Create `.env.local` in `apps/isomorphic/`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 🚨 Common Issues & Solutions

### Issue 1: "Network Error" or "Failed to fetch"
**Cause:** Backend not running or wrong URL
**Solution:**
- Ensure backend is running on `http://localhost:8000`
- Check if API endpoints are accessible
- Verify CORS settings in backend

### Issue 2: "404 Not Found"
**Cause:** Wrong API endpoint paths
**Solution:**
- Verify backend has endpoints at `/api/v1/overview/*`
- Check if backend is running on correct port

### Issue 3: "CORS Error"
**Cause:** Backend doesn't allow frontend origin
**Solution:**
- Add CORS configuration to backend
- Allow `http://localhost:3000` origin

### Issue 4: "Loading forever"
**Cause:** API calls hanging
**Solution:**
- Check network tab in browser dev tools
- Verify API response format matches expected structure

## 🔧 Debug Steps

### Step 1: Check Browser Console
1. Open browser dev tools (F12)
2. Go to Console tab
3. Look for any error messages
4. Check Network tab for failed requests

### Step 2: Test Individual Endpoints
Visit these URLs directly in browser:
- `http://localhost:8000/api/v1/overview/metrics`
- `http://localhost:8000/api/v1/overview/validators`
- `http://localhost:8000/api/v1/overview/rounds/current`

### Step 3: Check API Response Format
Ensure your backend returns data in this format:
```json
{
  "data": { /* actual data */ },
  "success": true
}
```

## ✅ Expected Behavior

When working correctly, you should see:

1. **Overview Page** (`/overview`):
   - Loading skeletons initially
   - Real data appears after API calls complete
   - Network status indicator shows "healthy"
   - Refresh button works

2. **API Test Page** (`/api-test`):
   - All endpoints show "✅ Success"
   - Data is displayed for each endpoint
   - No error messages

## 🚀 Quick Fixes

### If backend is not running:
```bash
# Start your backend server
# (command depends on your backend setup)
```

### If wrong API URL:
```bash
# Update .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://your-backend-url:port" > apps/isomorphic/.env.local
```

### If CORS issues:
Add to your backend configuration:
```python
# Example for FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📞 Need Help?

If you're still having issues:

1. **Check the API Test page**: `http://localhost:3000/api-test`
2. **Share the error messages** from browser console
3. **Verify backend is running** and accessible
4. **Check API response format** matches the specifications

The integration should work seamlessly once the backend is running and accessible! 🎉
