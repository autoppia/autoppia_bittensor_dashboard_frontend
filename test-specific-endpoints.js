#!/usr/bin/env node

/**
 * Test specific endpoints that are failing in the UI
 * Based on the dashboard screenshot analysis
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:8000';
const TIMEOUT = 10000;

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

/**
 * Test a single endpoint with detailed analysis
 */
async function testEndpoint(name, url, expectedStructure = null) {
  console.log(`${colors.cyan}Testing: ${name}${colors.reset}`);
  console.log(`${colors.blue}URL: ${url}${colors.reset}`);
  
  try {
    const response = await makeRequest(url);
    
    console.log(`${colors.green}✓ Status: ${response.status}${colors.reset}`);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`${colors.green}✓ Response received successfully${colors.reset}`);
      
      // Show response structure
      if (response.data && typeof response.data === 'object') {
        console.log(`${colors.magenta}Response structure:${colors.reset}`);
        console.log(JSON.stringify(response.data, null, 2));
        
        // Check for expected structure
        if (expectedStructure) {
          const missingFields = expectedStructure.filter(field => {
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
            console.log(`${colors.yellow}⚠ Missing expected fields: ${missingFields.join(', ')}${colors.reset}`);
          } else {
            console.log(`${colors.green}✓ All expected fields present${colors.reset}`);
          }
        }
      } else {
        console.log(`${colors.yellow}⚠ Response is not JSON or is empty${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ HTTP Error: ${response.status}${colors.reset}`);
      if (response.data) {
        console.log(`${colors.red}Error details: ${JSON.stringify(response.data)}${colors.reset}`);
      }
    }
  } catch (error) {
    console.log(`${colors.red}✗ Request failed: ${error.message}${colors.reset}`);
  }
  
  console.log(''); // Empty line for readability
}

/**
 * Main function to test specific failing endpoints
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}Testing Specific Endpoints from Dashboard UI${colors.reset}\n`);
  
  // Test the endpoints that are failing in the UI based on the screenshot analysis
  
  // 1. Test overview metrics (this should be working based on the cards showing data)
  await testEndpoint(
    'Overview Metrics (for metric cards)',
    `${BASE_URL}/api/v1/overview/metrics`,
    ['data.metrics.topScore', 'data.metrics.totalWebsites', 'data.metrics.totalValidators', 'data.metrics.totalMiners']
  );
  
  // 2. Test validators endpoint (this is failing in the "What's happening on the subnet" section)
  await testEndpoint(
    'Overview Validators (for validator list)',
    `${BASE_URL}/api/v1/overview/validators`,
    ['data.validators', 'data.total']
  );
  
  // 3. Test validators with limit (as used in the UI)
  await testEndpoint(
    'Overview Validators with limit=6',
    `${BASE_URL}/api/v1/overview/validators?limit=6`,
    ['data.validators', 'data.total']
  );
  
  // 4. Test current round (this might be causing the general overview error)
  await testEndpoint(
    'Current Round',
    `${BASE_URL}/api/v1/overview/rounds/current`,
    ['data.round.id', 'data.round.status']
  );
  
  // 5. Test leaderboard (for the chart that's working)
  await testEndpoint(
    'Leaderboard (for chart)',
    `${BASE_URL}/api/v1/overview/leaderboard`,
    ['data.leaderboard']
  );
  
  // 6. Test leaderboard with timeRange parameter
  await testEndpoint(
    'Leaderboard with timeRange=7D',
    `${BASE_URL}/api/v1/overview/leaderboard?timeRange=7D`,
    ['data.leaderboard']
  );
  
  // 7. Test network status
  await testEndpoint(
    'Network Status',
    `${BASE_URL}/api/v1/overview/network-status`,
    ['data.status', 'data.message']
  );
  
  // 8. Test recent activity
  await testEndpoint(
    'Recent Activity',
    `${BASE_URL}/api/v1/overview/recent-activity`,
    ['data.activities', 'data.total']
  );
  
  // 9. Test performance trends
  await testEndpoint(
    'Performance Trends',
    `${BASE_URL}/api/v1/overview/performance-trends`,
    ['data.trends', 'data.period']
  );
  
  // 10. Test statistics
  await testEndpoint(
    'Statistics',
    `${BASE_URL}/api/v1/overview/statistics`,
    ['data.statistics.totalStake', 'data.statistics.totalEmission']
  );
  
  console.log(`${colors.bright}${colors.yellow}=== ANALYSIS ===${colors.reset}\n`);
  console.log(`${colors.cyan}Based on the dashboard screenshot:${colors.reset}`);
  console.log(`${colors.green}✓ Working:${colors.reset} Metric cards (TOP SCORE, WEBSITES, VALIDATORS, MINERS) and Top Miner Score chart`);
  console.log(`${colors.red}✗ Failing:${colors.reset} General overview data and validator list in "What's happening on the subnet"`);
  console.log(`\n${colors.yellow}The issue appears to be:${colors.reset}`);
  console.log(`1. Some endpoints are working (metrics, leaderboard) but others are failing`);
  console.log(`2. The frontend is calling multiple endpoints and if any fail, it shows "Error loading overview data"`);
  console.log(`3. The validator list specifically is failing to load`);
}

// Run the tests
main().catch(console.error);
