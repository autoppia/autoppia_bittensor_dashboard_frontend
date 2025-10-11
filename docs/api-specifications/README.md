# AutoPPIA Bittensor Dashboard - API Specifications

This folder contains all API specifications, integration guides, and documentation for the AutoPPIA Bittensor Dashboard frontend-backend communication.

## 📁 Folder Structure

```
docs/api-specifications/
├── README.md                           # This file - Overview and navigation
├── OVERVIEW_API_SPECIFICATIONS.md      # Overview section API endpoints
├── ROUNDS_API_SPECIFICATIONS.md        # Rounds section API endpoints
├── API_INTEGRATION_SETUP.md            # Frontend integration setup guide
├── DEBUG_API_INTEGRATION.md            # Debugging guide for API issues
├── BROWSER_EXTENSION_FIX.md            # Browser extension troubleshooting
└── CHART_AND_VALIDATOR_FIXES.md        # Chart and validator display fixes
```

## 🚀 Quick Start

### For Backend Developers
1. **Start with**: `OVERVIEW_API_SPECIFICATIONS.md` - Complete overview endpoints
2. **Then**: `ROUNDS_API_SPECIFICATIONS.md` - Complete rounds endpoints
3. **Reference**: `API_INTEGRATION_SETUP.md` - Environment and setup details

### For Frontend Developers
1. **Setup**: `API_INTEGRATION_SETUP.md` - Environment configuration
2. **Debugging**: `DEBUG_API_INTEGRATION.md` - Common issues and solutions
3. **Troubleshooting**: `BROWSER_EXTENSION_FIX.md` - Browser extension issues

## 📋 API Sections

### 1. Overview Section
- **File**: `OVERVIEW_API_SPECIFICATIONS.md`
- **Endpoints**: 11 endpoints for dashboard overview
- **Status**: ✅ **Ready for Backend Implementation**
- **Frontend**: ✅ **Fully Integrated**

**Key Endpoints:**
- `GET /api/v1/overview/metrics` - Dashboard metrics
- `GET /api/v1/overview/validators` - Validators list
- `GET /api/v1/overview/rounds/current` - Current round
- `GET /api/v1/overview/leaderboard` - Performance leaderboard
- `GET /api/v1/overview/network-status` - Network status

### 2. Rounds Section
- **File**: `ROUNDS_API_SPECIFICATIONS.md`
- **Endpoints**: 14 endpoints for rounds management
- **Status**: ✅ **Ready for Backend Implementation**
- **Frontend**: ✅ **Service Created, Pending Integration**

**Key Endpoints:**
- `GET /api/v1/rounds` - Rounds list
- `GET /api/v1/rounds/{id}` - Round details
- `GET /api/v1/rounds/{id}/statistics` - Round statistics
- `GET /api/v1/rounds/{id}/miners` - Round miners
- `GET /api/v1/rounds/{id}/validators` - Round validators
- `GET /api/v1/rounds/{id}/activity` - Activity feed
- `GET /api/v1/rounds/{id}/progress` - Progress tracking

## 🔧 Integration Status

### Overview Section
- ✅ **API Service**: Complete with types, service, and hooks
- ✅ **Frontend Integration**: All components updated to use API
- ✅ **Backend**: Endpoints implemented and working
- ✅ **Testing**: Verified with real data

### Rounds Section
- ✅ **API Service**: Complete with types, service, and hooks
- ⏳ **Frontend Integration**: Service ready, components pending update
- ⏳ **Backend**: Endpoints need implementation
- ✅ **Testing**: Test page created for verification

## 🛠️ Development Workflow

### Backend Implementation Order
1. **Priority 1**: Overview endpoints (already working)
2. **Priority 2**: Rounds endpoints (specifications ready)

### Frontend Integration Order
1. **Completed**: Overview section integration
2. **Next**: Rounds section component updates

## 📊 API Response Format

All endpoints follow this consistent format:

```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  },
  "error": null,
  "code": null
}
```

## 🔍 Testing

### Frontend Test Pages
- **Overview**: `http://localhost:3002/overview` (integrated)
- **Rounds**: `http://localhost:3002/rounds-api-test` (test page)
- **API Test**: `http://localhost:3002/api-test` (general testing)

### Backend Testing
Use the specifications in each file to test endpoints:
```bash
# Example: Test overview metrics
curl http://localhost:8000/api/v1/overview/metrics

# Example: Test rounds current
curl http://localhost:8000/api/v1/rounds/current
```

## 🚨 Common Issues & Solutions

### 1. API Connection Issues
- **File**: `DEBUG_API_INTEGRATION.md`
- **Solutions**: Environment setup, CORS, network connectivity

### 2. Browser Extension Errors
- **File**: `BROWSER_EXTENSION_FIX.md`
- **Issue**: Talisman extension interference
- **Solution**: Disable extension or use incognito mode

### 3. Chart Display Issues
- **File**: `CHART_AND_VALIDATOR_FIXES.md`
- **Issue**: Insufficient data for chart rendering
- **Solution**: Handle small datasets gracefully

## 📝 Environment Configuration

### Required Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Development URLs
- **Frontend**: `http://localhost:3002`
- **Backend**: `http://localhost:8000`

## 🔄 Next Steps

### Immediate (Backend Team)
1. Implement rounds API endpoints using `ROUNDS_API_SPECIFICATIONS.md`
2. Test endpoints with provided specifications
3. Verify response format matches frontend expectations

### Immediate (Frontend Team)
1. Update rounds components to use new API service
2. Test integration with `http://localhost:3002/rounds-api-test`
3. Replace static data with dynamic API calls

### Future Sections
- **Agents Section**: API service and specifications
- **Tasks Section**: API service and specifications
- **Websites Section**: API service and specifications

## 📞 Support

### For API Issues
1. Check the relevant specification file
2. Review the debugging guide
3. Test with the provided test pages
4. Verify environment configuration

### For Integration Issues
1. Check browser console for errors
2. Verify API endpoints are responding
3. Review the integration setup guide
4. Test with the API test page

---

## 📚 Documentation Index

| File | Purpose | Status | Priority |
|------|---------|--------|----------|
| `OVERVIEW_API_SPECIFICATIONS.md` | Overview endpoints | ✅ Complete | High |
| `ROUNDS_API_SPECIFICATIONS.md` | Rounds endpoints | ✅ Complete | High |
| `API_INTEGRATION_SETUP.md` | Setup guide | ✅ Complete | Medium |
| `DEBUG_API_INTEGRATION.md` | Debugging guide | ✅ Complete | Medium |
| `BROWSER_EXTENSION_FIX.md` | Browser issues | ✅ Complete | Low |
| `CHART_AND_VALIDATOR_FIXES.md` | UI fixes | ✅ Complete | Low |

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Status**: Ready for Backend Implementation
