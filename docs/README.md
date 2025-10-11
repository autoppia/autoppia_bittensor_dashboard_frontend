# AutoPPIA Bittensor Dashboard - Documentation

Welcome to the AutoPPIA Bittensor Dashboard documentation. This folder contains all project documentation, API specifications, and guides.

## 📁 Documentation Structure

```
docs/
├── README.md                    # This file - Main documentation index
└── api-specifications/          # API documentation and specifications
    ├── README.md                # API specifications overview
    ├── OVERVIEW_API_SPECIFICATIONS.md
    ├── ROUNDS_API_SPECIFICATIONS.md
    ├── API_INTEGRATION_SETUP.md
    ├── DEBUG_API_INTEGRATION.md
    ├── BROWSER_EXTENSION_FIX.md
    └── CHART_AND_VALIDATOR_FIXES.md
```

## 🚀 Quick Navigation

### For Backend Developers
- **[API Specifications Overview](./api-specifications/README.md)** - Complete API documentation
- **[Overview API](./api-specifications/OVERVIEW_API_SPECIFICATIONS.md)** - 11 endpoints ready for implementation
- **[Rounds API](./api-specifications/ROUNDS_API_SPECIFICATIONS.md)** - 14 endpoints ready for implementation

### For Frontend Developers
- **[API Integration Setup](./api-specifications/API_INTEGRATION_SETUP.md)** - Environment and setup guide
- **[Debugging Guide](./api-specifications/DEBUG_API_INTEGRATION.md)** - Common issues and solutions
- **[Browser Extension Fix](./api-specifications/BROWSER_EXTENSION_FIX.md)** - Browser extension troubleshooting

### For Project Managers
- **[API Specifications Overview](./api-specifications/README.md)** - Project status and priorities
- **[Chart and Validator Fixes](./api-specifications/CHART_AND_VALIDATOR_FIXES.md)** - UI fixes and improvements

## 📊 Project Status

### ✅ Completed
- **Overview Section**: Full API service and frontend integration
- **Rounds Section**: Complete API service and specifications
- **Documentation**: Comprehensive API specifications and guides
- **Testing**: Test pages and debugging tools

### ⏳ In Progress
- **Rounds Integration**: Frontend components need API integration
- **Backend Implementation**: Rounds endpoints need implementation

### 🔄 Next Steps
- **Agents Section**: API service and specifications
- **Tasks Section**: API service and specifications
- **Websites Section**: API service and specifications

## 🛠️ Development Environment

### Frontend
- **URL**: `http://localhost:3002`
- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS

### Backend
- **URL**: `http://localhost:8000`
- **API Base**: `/api/v1/`

### Environment Variables
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 📋 API Sections Overview

| Section | Endpoints | Status | Frontend | Backend |
|---------|-----------|--------|----------|---------|
| **Overview** | 11 | ✅ Complete | ✅ Integrated | ✅ Working |
| **Rounds** | 14 | ✅ Complete | ⏳ Pending | ⏳ Pending |
| **Agents** | TBD | 🔄 Planned | 🔄 Planned | 🔄 Planned |
| **Tasks** | TBD | 🔄 Planned | 🔄 Planned | 🔄 Planned |
| **Websites** | TBD | 🔄 Planned | 🔄 Planned | 🔄 Planned |

## 🧪 Testing

### Frontend Test Pages
- **Overview**: `http://localhost:3002/overview`
- **Rounds Test**: `http://localhost:3002/rounds-api-test`
- **API Test**: `http://localhost:3002/api-test`

### Backend Testing
Use the specifications in the `api-specifications/` folder to test endpoints.

## 🔍 Troubleshooting

### Common Issues
1. **API Connection**: Check environment variables and backend status
2. **Browser Extensions**: See browser extension fix guide
3. **Chart Display**: See chart and validator fixes guide
4. **Integration Issues**: See debugging guide

### Getting Help
1. Check the relevant documentation file
2. Review the debugging guide
3. Test with provided test pages
4. Verify environment configuration

## 📝 Contributing

### Adding New API Sections
1. Create API specifications in `api-specifications/`
2. Create service files in `src/services/api/`
3. Create React hooks in `src/services/hooks/`
4. Create test pages for verification
5. Update documentation

### Documentation Updates
1. Update relevant specification files
2. Update this README if needed
3. Update API specifications overview
4. Test all changes

## 📞 Support

For questions or issues:
1. Check the relevant documentation
2. Review the debugging guides
3. Test with provided tools
4. Verify environment setup

---

**Project**: AutoPPIA Bittensor Dashboard  
**Version**: 1.0  
**Last Updated**: January 2024  
**Status**: Active Development
