# Test Files Archive

This folder contains all test files and temporary documentation created during the development and debugging process of the AutoPPIA Bittensor Dashboard.

## 📁 File Organization

### JavaScript Test Files
These are Node.js test scripts used for testing API endpoints and functionality:

| File | Purpose | Description |
|------|---------|-------------|
| `test-round-stats-api-integration.js` | API Integration Testing | Tests the rounds statistics API endpoints integration |
| `test-validator-image-fix.js` | Validator Images | Tests validator image loading and fallback mechanisms |
| `test-progressive-loading.js` | Progressive Loading | Tests progressive loading implementation for large datasets |
| `test-validator-selection.js` | Validator Selection | Tests validator selection functionality and UI interactions |
| `test-rounds-endpoints.js` | Rounds API Testing | Comprehensive testing of all rounds API endpoints |
| `quick-test-endpoints.js` | Quick API Testing | Quick endpoint testing script for development |

### Documentation Files
These are temporary documentation files created during development and debugging:

| File | Purpose | Description |
|------|---------|-------------|
| `ROUND_STATS_API_INTEGRATION_FIX.md` | API Integration Fix | Documentation of fixes applied to rounds stats API integration |
| `VALIDATOR_IMAGES_FIX_REPORT.md` | Validator Images Fix | Report on validator image loading issues and solutions |
| `ROUNDS_API_ANALYSIS_AND_IMPROVEMENTS.md` | API Analysis | Analysis of rounds API performance and improvement recommendations |
| `PROGRESSIVE_LOADING_IMPLEMENTATION.md` | Progressive Loading | Documentation of progressive loading implementation details |
| `VALIDATOR_SELECTION_FIX_REPORT.md` | Validator Selection Fix | Report on validator selection issues and fixes |
| `ROUNDS_ENDPOINTS_PERFORMANCE_REPORT.md` | Performance Report | Performance analysis of rounds API endpoints |
| `BACKEND_API_IMPLEMENTATION.md` | Backend Implementation | Documentation of backend API implementation status |
| `BACKEND_API_ISSUE_REPORT.md` | Backend Issues | Report on backend API issues and resolutions |
| `API_FIXES_APPLIED.md` | API Fixes | Summary of all API fixes applied during development |
| `TEST_OVERVIEW_INTEGRATION.md` | Overview Testing | Documentation of overview section integration testing |

## 🚀 Usage

### Running JavaScript Tests
```bash
# Navigate to the test-files directory
cd test-files

# Run individual test files
node test-rounds-endpoints.js
node test-validator-image-fix.js
node quick-test-endpoints.js

# Or run all tests (if a test runner is set up)
npm test
```

### Reading Documentation
All markdown files contain detailed information about:
- Issues encountered during development
- Solutions implemented
- Performance analysis
- API integration details
- Debugging steps

## 📝 Notes

- These files were created during the development process for testing and debugging
- They are preserved here for reference and future development
- Some files may contain outdated information as the project evolves
- Always refer to the main documentation in the `docs/` folder for current information

## 🔄 Maintenance

- Files in this folder should be reviewed periodically
- Outdated test files can be removed if no longer relevant
- New test files should be added here during development
- Update this README when adding new files

---

**Created:** $(date)  
**Purpose:** Archive of test files and temporary documentation  
**Status:** Archived for reference
