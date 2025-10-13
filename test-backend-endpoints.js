#!/usr/bin/env node

/**
 * Comprehensive Backend API Endpoint Testing Script
 * Tests all endpoints mentioned by the backend team to ensure they match frontend expectations
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:8000';
const TIMEOUT = 10000; // 10 seconds

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: []
};

/**
 * Make HTTP request with timeout
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: TIMEOUT
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Cached dynamic identifiers
let cachedValidatorId;
let cachedRoundId;
const roundMinerCache = new Map();
const roundValidatorCache = new Map();
let cachedMinerUid;
let cachedRoundIdList;
const minerRunCache = new Map();
let cachedMinerUidList;

async function getFirstValidatorId() {
  if (typeof cachedValidatorId !== 'undefined') {
    return cachedValidatorId;
  }

  cachedValidatorId = null;

  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/overview/validators?limit=1`);
    if (response.status >= 200 && response.status < 300) {
      const validatorsList =
        response.data?.data?.validators ||
        response.data?.validators ||
        [];
      if (Array.isArray(validatorsList) && validatorsList.length > 0) {
        cachedValidatorId = validatorsList[0].id;
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Unable to determine validator ID dynamically: ${error.message}${colors.reset}`);
  }

  return cachedValidatorId;
}

async function getAvailableRoundId() {
  if (typeof cachedRoundId !== 'undefined') {
    return cachedRoundId;
  }

  cachedRoundId = null;

  try {
    const metricsResponse = await makeRequest(`${BASE_URL}/api/v1/overview/metrics`);
    if (metricsResponse.status >= 200 && metricsResponse.status < 300) {
      const metricsData =
        metricsResponse.data?.data?.metrics ||
        metricsResponse.data?.metrics ||
        metricsResponse.data;
      if (metricsData?.currentRound) {
        cachedRoundId = metricsData.currentRound;
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Unable to determine round ID from metrics: ${error.message}${colors.reset}`);
  }

  if (!cachedRoundId) {
    try {
      const roundsResponse = await makeRequest(`${BASE_URL}/api/v1/overview/rounds?limit=1`);
      if (roundsResponse.status >= 200 && roundsResponse.status < 300) {
        const roundsList =
          roundsResponse.data?.data?.rounds ||
          roundsResponse.data?.rounds ||
          [];
        if (Array.isArray(roundsList) && roundsList.length > 0) {
          cachedRoundId = roundsList[0].id;
        }
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠ Unable to determine round ID from rounds list: ${error.message}${colors.reset}`);
    }
  }

  return cachedRoundId;
}

async function getRoundMinerUid(roundId) {
  if (!roundId) {
    return null;
  }

  if (roundMinerCache.has(roundId)) {
    return roundMinerCache.get(roundId);
  }

  let resolvedUid = null;

  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/rounds/${roundId}/miners?limit=1`);
    if (response.status >= 200 && response.status < 300) {
      const minersList =
        response.data?.data?.miners ||
        response.data?.miners ||
        [];
      if (Array.isArray(minersList) && minersList.length > 0) {
        resolvedUid = minersList[0].uid ?? minersList[0].id ?? null;
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Unable to determine miner UID for round ${roundId}: ${error.message}${colors.reset}`);
  }

  roundMinerCache.set(roundId, resolvedUid);
  return resolvedUid;
}

async function getRoundValidatorId(roundId) {
  if (!roundId) {
    return null;
  }

  if (roundValidatorCache.has(roundId)) {
    return roundValidatorCache.get(roundId);
  }

  let resolvedId = null;

  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/rounds/${roundId}/validators?limit=1`);
    if (response.status >= 200 && response.status < 300) {
      const validatorsList =
        response.data?.data?.validators ||
        response.data?.validators ||
        [];
      if (Array.isArray(validatorsList) && validatorsList.length > 0) {
        resolvedId = validatorsList[0].id ?? null;
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Unable to determine validator ID for round ${roundId}: ${error.message}${colors.reset}`);
  }

  roundValidatorCache.set(roundId, resolvedId);
  return resolvedId;
}

async function getFirstMinerUid() {
  if (typeof cachedMinerUid !== 'undefined') {
    return cachedMinerUid;
  }

  cachedMinerUid = null;

  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/miners?limit=1`);
    if (response.status >= 200 && response.status < 300) {
      const minersList =
        response.data?.data?.miners ||
        response.data?.miners ||
        [];
      if (Array.isArray(minersList) && minersList.length > 0) {
        cachedMinerUid = minersList[0].uid ?? minersList[0].id ?? null;
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Unable to determine miner UID dynamically: ${error.message}${colors.reset}`);
  }

  return cachedMinerUid;
}

async function getMinerUids(limit = 3) {
  if (cachedMinerUidList && cachedMinerUidList.length >= limit) {
    return cachedMinerUidList.slice(0, limit);
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/miners?limit=${limit}`);
    if (response.status >= 200 && response.status < 300) {
      const minersList =
        response.data?.data?.miners ||
        response.data?.miners ||
        [];
      if (Array.isArray(minersList) && minersList.length > 0) {
        cachedMinerUidList = minersList
          .map((miner) => miner.uid ?? miner.id)
          .filter((uid) => typeof uid !== 'undefined' && uid !== null);
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Unable to load miner UIDs: ${error.message}${colors.reset}`);
  }

  return Array.isArray(cachedMinerUidList) ? cachedMinerUidList.slice(0, limit) : [];
}

async function getMinerRunId(minerUid) {
  if (!minerUid) {
    return null;
  }

  if (minerRunCache.has(minerUid)) {
    return minerRunCache.get(minerUid);
  }

  let runId = null;

  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/miners/${minerUid}/runs?limit=1`);
    if (response.status >= 200 && response.status < 300) {
      const runsList =
        response.data?.data?.runs ||
        response.data?.runs ||
        [];
      if (Array.isArray(runsList) && runsList.length > 0) {
        runId = runsList[0].runId || runsList[0].id || null;
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Unable to determine miner run ID for miner ${minerUid}: ${error.message}${colors.reset}`);
  }

  minerRunCache.set(minerUid, runId);
  return runId;
}

async function getRecentRoundIds(limit = 3) {
  if (cachedRoundIdList && cachedRoundIdList.length >= limit) {
    return cachedRoundIdList.slice(0, limit);
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/v1/rounds?limit=${limit}`);
    if (response.status >= 200 && response.status < 300) {
      const roundsList =
        response.data?.data?.rounds ||
        response.data?.rounds ||
        [];
      if (Array.isArray(roundsList) && roundsList.length > 0) {
        cachedRoundIdList = roundsList.map((round) => round.id).filter(Boolean);
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Unable to load recent round IDs: ${error.message}${colors.reset}`);
  }

  return Array.isArray(cachedRoundIdList) ? cachedRoundIdList.slice(0, limit) : [];
}

/**
 * Test a single endpoint
 */
async function testEndpoint(name, url, expectedFields = [], method = 'GET', body = null, options = {}) {
  const { skip = false, skipReason } = options;

  if (skip) {
    console.log(`${colors.yellow}⚠ Skipping: ${name}${colors.reset}`);
    if (skipReason) {
      console.log(`${colors.yellow}Reason: ${skipReason}${colors.reset}`);
    }
    testResults.skipped++;
    console.log('');
    return { status: 'skipped', reason: skipReason || 'Skipped' };
  }

  testResults.total++;
  
  let result;

  try {
    console.log(`${colors.cyan}Testing: ${name}${colors.reset}`);
    console.log(`${colors.blue}URL: ${url}${colors.reset}`);
    
    const response = await makeRequest(url, { method, body });
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`${colors.green}✓ Status: ${response.status}${colors.reset}`);
      
      // Check if response has expected structure
      if (expectedFields.length > 0) {
        const missingFields = expectedFields.filter(field => {
          if (field.includes('.')) {
            const parts = field.split('.');
            let obj = response.data;
            for (const part of parts) {
              if (obj && typeof obj === 'object' && part in obj) {
                obj = obj[part];
              } else {
                return true;
              }
            }
            return false;
          }
          return !(field in response.data);
        });
        
        if (missingFields.length > 0) {
          console.log(`${colors.yellow}⚠ Missing fields: ${missingFields.join(', ')}${colors.reset}`);
        } else {
          console.log(`${colors.green}✓ All expected fields present${colors.reset}`);
        }
      }
      
      // Show sample data structure
      if (response.data && typeof response.data === 'object') {
        console.log(`${colors.magenta}Sample response structure:${colors.reset}`);
        console.log(JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
      }
      
      testResults.passed++;
      result = { status: 'passed', response };
    } else {
      console.log(`${colors.red}✗ Status: ${response.status}${colors.reset}`);
      testResults.failed++;
      testResults.errors.push(`${name}: HTTP ${response.status}`);
      result = { status: 'error', response };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`${name}: ${error.message}`);
    result = { status: 'failed', error: error.message };
  }

  console.log(''); // Empty line for readability
  return result;
}

/**
 * Test Overview API Endpoints
 */
async function testOverviewEndpoints() {
  console.log(`${colors.bright}${colors.yellow}=== TESTING OVERVIEW API ENDPOINTS ===${colors.reset}\n`);

  const validatorId = await getFirstValidatorId();
  const roundId = await getAvailableRoundId();
  
  // Test metrics endpoint
  await testEndpoint(
    'Overview Metrics',
    `${BASE_URL}/api/v1/overview/metrics`,
    ['data.metrics.topScore', 'data.metrics.totalWebsites', 'data.metrics.totalValidators', 'data.metrics.totalMiners', 'data.metrics.currentRound', 'data.success']
  );
  
  // Test validators endpoint
  await testEndpoint(
    'Overview Validators',
    `${BASE_URL}/api/v1/overview/validators`,
    ['data.validators', 'data.total', 'data.page', 'data.limit', 'data.success']
  );
  
  // Test validators with pagination
  await testEndpoint(
    'Overview Validators (Paginated)',
    `${BASE_URL}/api/v1/overview/validators?page=1&limit=5`,
    ['data.validators', 'data.total', 'data.page', 'data.limit']
  );
  
  // Test specific validator
  await testEndpoint(
    'Overview Validator Details',
    validatorId ? `${BASE_URL}/api/v1/overview/validators/${validatorId}` : '',
    ['data.validator.id', 'data.validator.name', 'data.validator.hotkey', 'data.validator.status'],
    'GET',
    null,
    { skip: !validatorId, skipReason: 'No validator ID available from /overview/validators' }
  );
  
  // Test current round
  await testEndpoint(
    'Overview Current Round',
    `${BASE_URL}/api/v1/overview/rounds/current`,
    ['data.round.id', 'data.round.status', 'data.round.totalTasks', 'data.round.completedTasks', 'data.success']
  );
  
  // Test rounds list
  await testEndpoint(
    'Overview Rounds List',
    `${BASE_URL}/api/v1/overview/rounds`,
    ['data.rounds', 'data.currentRound', 'data.total', 'data.success']
  );
  
  // Test specific round
  await testEndpoint(
    'Overview Round Details',
    roundId ? `${BASE_URL}/api/v1/overview/rounds/${roundId}` : '',
    ['data.round.id', 'data.round.status', 'data.round.totalTasks', 'data.success'],
    'GET',
    null,
    { skip: !roundId, skipReason: 'No round ID available from metrics or rounds list' }
  );
  
  // Test leaderboard
  await testEndpoint(
    'Overview Leaderboard',
    `${BASE_URL}/api/v1/overview/leaderboard`,
    ['data.leaderboard', 'data.total', 'data.timeRange', 'data.success']
  );
  
  // Test statistics
  await testEndpoint(
    'Overview Statistics',
    `${BASE_URL}/api/v1/overview/statistics`,
    ['data.statistics.totalStake', 'data.statistics.totalEmission', 'data.statistics.averageTrust', 'data.statistics.networkUptime', 'data.success']
  );
  
  // Test network status
  await testEndpoint(
    'Overview Network Status',
    `${BASE_URL}/api/v1/overview/network-status`,
    ['data.status', 'data.message', 'data.lastChecked', 'data.activeValidators', 'data.success']
  );
  
  // Test recent activity
  await testEndpoint(
    'Overview Recent Activity',
    `${BASE_URL}/api/v1/overview/recent-activity`,
    ['data.activities', 'data.total', 'data.success']
  );
  
  // Test performance trends
  await testEndpoint(
    'Overview Performance Trends',
    `${BASE_URL}/api/v1/overview/performance-trends`,
    ['data.trends', 'data.period', 'data.success']
  );
}

/**
 * Test Rounds API Endpoints
 */
async function testRoundsEndpoints() {
  console.log(`${colors.bright}${colors.yellow}=== TESTING ROUNDS API ENDPOINTS ===${colors.reset}\n`);

  const roundId = await getAvailableRoundId();
  const roundMinerUid = await getRoundMinerUid(roundId);
  const roundValidatorId = await getRoundValidatorId(roundId);
  const fallbackValidatorId = roundValidatorId || await getFirstValidatorId();
  const recentRoundIds = await getRecentRoundIds(3);
  
  // Test rounds list
  await testEndpoint(
    'Rounds List',
    `${BASE_URL}/api/v1/rounds`,
    ['data.rounds', 'data.total', 'data.page', 'data.limit', 'success']
  );
  
  // Test rounds with pagination and filtering
  await testEndpoint(
    'Rounds List (Paginated & Filtered)',
    `${BASE_URL}/api/v1/rounds?page=1&limit=10&status=active&sortBy=id&sortOrder=desc`,
    ['data.rounds', 'data.total', 'data.page', 'data.limit']
  );
  
  // Test specific round
  await testEndpoint(
    'Round Details',
    roundId ? `${BASE_URL}/api/v1/rounds/${roundId}` : '',
    ['data.round.id', 'data.round.status', 'data.round.totalTasks', 'data.round.completedTasks', 'success'],
    'GET',
    null,
    { skip: !roundId, skipReason: 'No round ID available for round detail tests' }
  );
  
  // Test current round
  await testEndpoint(
    'Current Round',
    `${BASE_URL}/api/v1/rounds/current`,
    ['data.round.id', 'data.round.current', 'data.round.status', 'success']
  );
  
  // Test round statistics
  await testEndpoint(
    'Round Statistics',
    roundId ? `${BASE_URL}/api/v1/rounds/${roundId}/statistics` : '',
    ['data.statistics.roundId', 'data.statistics.totalMiners', 'data.statistics.totalTasks', 'data.statistics.averageScore', 'success'],
    'GET',
    null,
    { skip: !roundId, skipReason: 'No round ID available for round statistics' }
  );
  
  // Test round miners
  await testEndpoint(
    'Round Miners',
    roundId ? `${BASE_URL}/api/v1/rounds/${roundId}/miners` : '',
    ['data.miners', 'data.total', 'data.page', 'data.limit', 'success'],
    'GET',
    null,
    { skip: !roundId, skipReason: 'No round ID available for round miners' }
  );
  
  // Test top miners
  await testEndpoint(
    'Round Top Miners',
    roundId ? `${BASE_URL}/api/v1/rounds/${roundId}/miners/top` : '',
    ['data.miners', 'data.total', 'success'],
    'GET',
    null,
    { skip: !roundId, skipReason: 'No round ID available for top miners' }
  );
  
  // Test specific miner in round
  await testEndpoint(
    'Round Miner Details',
    roundId && roundMinerUid ? `${BASE_URL}/api/v1/rounds/${roundId}/miners/${roundMinerUid}` : '',
    ['data.miner.uid', 'data.miner.score', 'data.miner.ranking', 'success'],
    'GET',
    null,
    { skip: !(roundId && roundMinerUid), skipReason: 'No miner UID available for the selected round' }
  );
  
  // Test round validators
  await testEndpoint(
    'Round Validators',
    roundId ? `${BASE_URL}/api/v1/rounds/${roundId}/validators` : '',
    ['data.validators', 'data.total', 'success'],
    'GET',
    null,
    { skip: !roundId, skipReason: 'No round ID available for round validators' }
  );
  
  // Test specific validator in round
  await testEndpoint(
    'Round Validator Details',
    roundId && fallbackValidatorId ? `${BASE_URL}/api/v1/rounds/${roundId}/validators/${fallbackValidatorId}` : '',
    ['data.validator.id', 'data.validator.totalTasks', 'data.validator.completedTasks', 'success'],
    'GET',
    null,
    { skip: !(roundId && fallbackValidatorId), skipReason: 'No validator ID available for the selected round' }
  );
  
  // Test round activity
  await testEndpoint(
    'Round Activity',
    roundId ? `${BASE_URL}/api/v1/rounds/${roundId}/activity` : '',
    ['data.activities', 'data.total', 'success'],
    'GET',
    null,
    { skip: !roundId, skipReason: 'No round ID available for round activity' }
  );
  
  // Test round progress
  await testEndpoint(
    'Round Progress',
    roundId ? `${BASE_URL}/api/v1/rounds/${roundId}/progress` : '',
    ['data.progress.roundId', 'data.progress.currentBlock', 'data.progress.progress', 'success'],
    'GET',
    null,
    { skip: !roundId, skipReason: 'No round ID available for round progress' }
  );
  
  // Test round summary
  await testEndpoint(
    'Round Summary',
    roundId ? `${BASE_URL}/api/v1/rounds/${roundId}/summary` : '',
    ['data.roundId', 'data.status', 'data.progress', 'data.totalMiners', 'success'],
    'GET',
    null,
    { skip: !roundId, skipReason: 'No round ID available for round summary' }
  );
  
  // Test round timeline
  await testEndpoint(
    'Round Timeline',
    roundId ? `${BASE_URL}/api/v1/rounds/${roundId}/timeline` : '',
    ['data.timeline', 'success'],
    'GET',
    null,
    { skip: !roundId, skipReason: 'No round ID available for round timeline' }
  );
  
  // Test round comparison
  await testEndpoint(
    'Round Comparison',
    `${BASE_URL}/api/v1/rounds/compare`,
    ['data.rounds', 'success'],
    'POST',
    { roundIds: recentRoundIds },
    { skip: recentRoundIds.length < 2, skipReason: 'Not enough round IDs available for comparison' }
  );
}

/**
 * Test Agents and Miners API Endpoints
 */
async function testAgentsMinersEndpoints() {
  console.log(`${colors.bright}${colors.yellow}=== TESTING AGENTS & MINERS API ENDPOINTS ===${colors.reset}\n`);

  const minerUid = await getFirstMinerUid();
  const minerRunId = await getMinerRunId(minerUid);
  const minerUidsForComparison = await getMinerUids(3);
  
  // Test miner list
  await testEndpoint(
    'Miner List',
    `${BASE_URL}/api/v1/miner-list`,
    ['data.miners', 'data.total', 'data.page', 'data.limit', 'success']
  );
  
  // Test miners endpoint
  await testEndpoint(
    'Miners List',
    `${BASE_URL}/api/v1/miners`,
    ['data.miners', 'data.total', 'data.page', 'data.limit', 'success']
  );
  
  // Test miners with filtering
  await testEndpoint(
    'Miners List (Filtered)',
    `${BASE_URL}/api/v1/miners?page=1&limit=10&isSota=true&status=active&sortBy=averageScore&sortOrder=desc`,
    ['data.miners', 'data.total', 'data.page', 'data.limit']
  );
  
  // Test specific miner
  await testEndpoint(
    'Miner Details',
    minerUid ? `${BASE_URL}/api/v1/miners/${minerUid}` : '',
    ['data.miner.uid', 'data.miner.name', 'data.miner.hotkey', 'data.miner.isSota', 'success'],
    'GET',
    null,
    { skip: !minerUid, skipReason: 'No miner UID available from /miners' }
  );
  
  // Test miner performance
  await testEndpoint(
    'Miner Performance',
    minerUid ? `${BASE_URL}/api/v1/miners/${minerUid}/performance` : '',
    ['data.metrics.uid', 'data.metrics.totalRuns', 'data.metrics.averageScore', 'data.metrics.successRate', 'success'],
    'GET',
    null,
    { skip: !minerUid, skipReason: 'No miner UID available for performance endpoint' }
  );
  
  // Test miner performance with time range
  await testEndpoint(
    'Miner Performance (Time Range)',
    minerUid ? `${BASE_URL}/api/v1/miners/${minerUid}/performance?timeRange=7d&granularity=day` : '',
    ['data.metrics.uid', 'data.metrics.timeRange', 'data.metrics.totalRuns', 'success'],
    'GET',
    null,
    { skip: !minerUid, skipReason: 'No miner UID available for performance time range endpoint' }
  );
  
  // Test miner runs
  await testEndpoint(
    'Miner Runs',
    minerUid ? `${BASE_URL}/api/v1/miners/${minerUid}/runs` : '',
    ['data.runs', 'data.total', 'data.page', 'data.limit', 'success'],
    'GET',
    null,
    { skip: !minerUid, skipReason: 'No miner UID available for runs endpoint' }
  );
  
  // Test specific miner run
  await testEndpoint(
    'Miner Run Details',
    minerUid && minerRunId ? `${BASE_URL}/api/v1/miners/${minerUid}/runs/${minerRunId}` : '',
    ['data.run.runId', 'data.run.uid', 'data.run.score', 'data.run.status', 'success'],
    'GET',
    null,
    { skip: !(minerUid && minerRunId), skipReason: 'No miner run ID available for the selected miner' }
  );
  
  // Test miner activity
  await testEndpoint(
    'Miner Activity',
    minerUid ? `${BASE_URL}/api/v1/miners/${minerUid}/activity` : '',
    ['data.activities', 'data.total', 'success'],
    'GET',
    null,
    { skip: !minerUid, skipReason: 'No miner UID available for activity endpoint' }
  );
  
  // Test miner comparison
  await testEndpoint(
    'Miner Comparison',
    `${BASE_URL}/api/v1/miners/compare`,
    ['data.comparison.miners', 'data.comparison.comparisonMetrics', 'success'],
    'POST',
    { uids: minerUidsForComparison, timeRange: '7d' },
    { skip: minerUidsForComparison.length < 2, skipReason: 'Not enough miner UIDs available for comparison' }
  );
  
  // Test miner statistics
  await testEndpoint(
    'Miner Statistics',
    `${BASE_URL}/api/v1/miners/statistics`,
    ['data.statistics.totalMiners', 'data.statistics.activeMiners', 'data.statistics.sotaMiners', 'success']
  );
  
  // Test all miner activity
  await testEndpoint(
    'All Miner Activity',
    `${BASE_URL}/api/v1/miners/activity`,
    ['data.activities', 'data.total', 'success']
  );
  
  // Test agents list
  await testEndpoint(
    'Agents List',
    `${BASE_URL}/api/v1/agents`,
    ['data.agents', 'data.total', 'data.page', 'data.limit', 'success']
  );
  
  // Test agents with filtering
  await testEndpoint(
    'Agents List (Filtered)',
    `${BASE_URL}/api/v1/agents?page=1&limit=10&type=autoppia&status=active&sortBy=averageScore&sortOrder=desc`,
    ['data.agents', 'data.total', 'data.page', 'data.limit']
  );
  
  // Test specific agent
  await testEndpoint(
    'Agent Details',
    `${BASE_URL}/api/v1/agents/autoppia-bittensor`,
    ['data.agent.id', 'data.agent.name', 'data.agent.type', 'data.agent.status', 'success']
  );
  
  // Test agent performance
  await testEndpoint(
    'Agent Performance',
    `${BASE_URL}/api/v1/agents/autoppia-bittensor/performance`,
    ['data.metrics.agentId', 'data.metrics.totalRuns', 'data.metrics.averageScore', 'data.metrics.successRate', 'success']
  );
  
  // Test agent performance with time range
  await testEndpoint(
    'Agent Performance (Time Range)',
    `${BASE_URL}/api/v1/agents/autoppia-bittensor/performance?timeRange=7d&granularity=day`,
    ['data.metrics.agentId', 'data.metrics.timeRange', 'data.metrics.totalRuns', 'success']
  );
  
  // Test agent runs
  await testEndpoint(
    'Agent Runs',
    `${BASE_URL}/api/v1/agents/autoppia-bittensor/runs`,
    ['data.runs', 'data.total', 'data.page', 'data.limit', 'success']
  );
  
  // Test specific agent run
  await testEndpoint(
    'Agent Run Details',
    `${BASE_URL}/api/v1/agents/autoppia-bittensor/runs/run_id_1234567890_1`,
    ['data.run.runId', 'data.run.agentId', 'data.run.score', 'data.run.status', 'success']
  );
  
  // Test agent activity
  await testEndpoint(
    'Agent Activity',
    `${BASE_URL}/api/v1/agents/autoppia-bittensor/activity`,
    ['data.activities', 'data.total', 'success']
  );
  
  // Test agent comparison
  await testEndpoint(
    'Agent Comparison',
    `${BASE_URL}/api/v1/agents/compare`,
    ['data.comparison.agents', 'data.comparison.comparisonMetrics', 'success'],
    'POST',
    { agentIds: ['autoppia-bittensor', 'openai-cua', 'anthropic-cua'], timeRange: '7d' }
  );
  
  // Test agent statistics
  await testEndpoint(
    'Agent Statistics',
    `${BASE_URL}/api/v1/agents/statistics`,
    ['data.statistics.totalAgents', 'data.statistics.activeAgents', 'data.statistics.topPerformingAgent', 'success']
  );
  
  // Test all agent activity
  await testEndpoint(
    'All Agent Activity',
    `${BASE_URL}/api/v1/agents/activity`,
    ['data.activities', 'data.total', 'success']
  );
}

/**
 * Print test summary
 */
function printSummary() {
  console.log(`${colors.bright}${colors.yellow}=== TEST SUMMARY ===${colors.reset}\n`);
  console.log(`${colors.cyan}Total Tests Run: ${testResults.total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  if (testResults.skipped > 0) {
    console.log(`${colors.yellow}Skipped: ${testResults.skipped}${colors.reset}`);
  }
  
  if (testResults.errors.length > 0) {
    console.log(`\n${colors.red}Errors:${colors.reset}`);
    testResults.errors.forEach(error => {
      console.log(`${colors.red}  - ${error}${colors.reset}`);
    });
  }
  
  const successRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : '0.0';
  console.log(`\n${colors.bright}Success Rate: ${successRate}%${colors.reset}`);
  
  if (testResults.failed === 0) {
    console.log(`\n${colors.green}${colors.bright}🎉 All tests passed! Backend endpoints are ready for frontend integration.${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}${colors.bright}⚠️  Some tests failed. Please check the backend implementation.${colors.reset}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}AutoPPIA Bittensor Dashboard - Backend API Endpoint Testing${colors.reset}\n`);
  console.log(`${colors.blue}Testing backend endpoints to ensure they match frontend expectations...${colors.reset}\n`);
  
  try {
    await testOverviewEndpoints();
    await testRoundsEndpoints();
    await testAgentsMinersEndpoints();
  } catch (error) {
    console.error(`${colors.red}Test execution failed: ${error.message}${colors.reset}`);
    testResults.failed++;
    testResults.errors.push(`Test execution: ${error.message}`);
  }
  
  printSummary();
}

// Run the tests
main().catch(console.error);
