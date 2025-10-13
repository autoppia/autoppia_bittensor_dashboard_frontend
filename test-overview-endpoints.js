#!/usr/bin/env node

/**
 * Focused test for Overview API endpoints
 * Tests all overview endpoints to identify which ones are not working
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
async function testEndpoint(name, url, expectedFields = [], options = {}) {
  const { skip = false, skipReason } = options;

  if (skip) {
    console.log(`${colors.yellow}⚠ Skipping: ${name}${colors.reset}`);
    if (skipReason) {
      console.log(`${colors.yellow}Reason: ${skipReason}${colors.reset}`);
    }
    return { status: 'skipped', reason: skipReason || 'Skipped' };
  }

  console.log(`${colors.cyan}Testing: ${name}${colors.reset}`);
  console.log(`${colors.blue}URL: ${url}${colors.reset}`);
  
  try {
    const response = await makeRequest(url);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`${colors.green}✓ Status: ${response.status} - WORKING${colors.reset}`);
      
      // Check for expected fields
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
      
      // Show sample data
      if (response.data && typeof response.data === 'object') {
        console.log(`${colors.magenta}Sample data:${colors.reset}`);
        console.log(JSON.stringify(response.data, null, 2).substring(0, 300) + '...');
      }
      
      return { status: 'working', response };
    } else {
      console.log(`${colors.red}✗ Status: ${response.status} - NOT WORKING${colors.reset}`);
      if (response.data) {
        console.log(`${colors.red}Error: ${JSON.stringify(response.data)}${colors.reset}`);
      }
      return { status: 'error', response };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Request failed: ${error.message} - NOT WORKING${colors.reset}`);
    return { status: 'failed', error: error.message };
  }
  
  console.log(''); // Empty line for readability
}

/**
 * Main function to test all overview endpoints
 */
async function main() {
  console.log(`${colors.bright}${colors.cyan}=== OVERVIEW API ENDPOINTS TEST ===${colors.reset}\n`);
  
  const results = [];

  // Gather dynamic identifiers to avoid hardcoded values
  let validatorDetailId = null;
  let roundDetailId = null;

  try {
    const validatorsPreview = await makeRequest(`${BASE_URL}/api/v1/overview/validators?limit=1`);
    if (validatorsPreview.status >= 200 && validatorsPreview.status < 300) {
      const validatorsList =
        validatorsPreview.data?.data?.validators ||
        validatorsPreview.data?.validators ||
        [];
      if (Array.isArray(validatorsList) && validatorsList.length > 0) {
        validatorDetailId = validatorsList[0].id;
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Unable to determine validator ID dynamically: ${error.message}${colors.reset}`);
  }

  try {
    const metricsPreview = await makeRequest(`${BASE_URL}/api/v1/overview/metrics`);
    if (metricsPreview.status >= 200 && metricsPreview.status < 300) {
      const metricsData =
        metricsPreview.data?.data?.metrics ||
        metricsPreview.data?.metrics ||
        metricsPreview.data;
      if (metricsData?.currentRound) {
        roundDetailId = metricsData.currentRound;
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Unable to determine current round from metrics: ${error.message}${colors.reset}`);
  }

  if (!roundDetailId) {
    try {
      const roundsPreview = await makeRequest(`${BASE_URL}/api/v1/overview/rounds?limit=1`);
      if (roundsPreview.status >= 200 && roundsPreview.status < 300) {
        const roundsList =
          roundsPreview.data?.data?.rounds ||
          roundsPreview.data?.rounds ||
          [];
        if (Array.isArray(roundsList) && roundsList.length > 0) {
          roundDetailId = roundsList[0].id;
        }
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠ Unable to determine round ID dynamically: ${error.message}${colors.reset}`);
    }
  }
  
  // Test all overview endpoints
  const endpoints = [
    {
      name: 'Overview Metrics',
      url: `${BASE_URL}/api/v1/overview/metrics`,
      expected: ['data.metrics.topScore', 'data.metrics.totalWebsites', 'data.metrics.totalValidators', 'data.metrics.totalMiners']
    },
    {
      name: 'Overview Validators',
      url: `${BASE_URL}/api/v1/overview/validators`,
      expected: ['data.validators', 'data.total']
    },
    {
      name: 'Overview Validators (Paginated)',
      url: `${BASE_URL}/api/v1/overview/validators?page=1&limit=5`,
      expected: ['data.validators', 'data.total', 'data.page', 'data.limit']
    },
    {
      name: 'Overview Validator Details',
      url: validatorDetailId ? `${BASE_URL}/api/v1/overview/validators/${validatorDetailId}` : '',
      expected: ['data.validator.id', 'data.validator.name'],
      skip: !validatorDetailId,
      skipReason: 'No validator ID available from /overview/validators'
    },
    {
      name: 'Overview Current Round',
      url: `${BASE_URL}/api/v1/overview/rounds/current`,
      expected: ['data.round.id', 'data.round.status']
    },
    {
      name: 'Overview Rounds List',
      url: `${BASE_URL}/api/v1/overview/rounds`,
      expected: ['data.rounds', 'data.total']
    },
    {
      name: 'Overview Round Details',
      url: roundDetailId ? `${BASE_URL}/api/v1/overview/rounds/${roundDetailId}` : '',
      expected: ['data.round.id', 'data.round.status'],
      skip: !roundDetailId,
      skipReason: 'No round ID available from metrics or rounds list'
    },
    {
      name: 'Overview Leaderboard',
      url: `${BASE_URL}/api/v1/overview/leaderboard`,
      expected: ['data.leaderboard', 'data.total']
    },
    {
      name: 'Overview Leaderboard (with timeRange)',
      url: `${BASE_URL}/api/v1/overview/leaderboard?timeRange=7D`,
      expected: ['data.leaderboard', 'data.total']
    },
    {
      name: 'Overview Statistics',
      url: `${BASE_URL}/api/v1/overview/statistics`,
      expected: ['data.statistics.totalStake', 'data.statistics.totalEmission']
    },
    {
      name: 'Overview Network Status',
      url: `${BASE_URL}/api/v1/overview/network-status`,
      expected: ['data.status', 'data.message']
    },
    {
      name: 'Overview Recent Activity',
      url: `${BASE_URL}/api/v1/overview/recent-activity`,
      expected: ['data.activities', 'data.total']
    },
    {
      name: 'Overview Performance Trends',
      url: `${BASE_URL}/api/v1/overview/performance-trends`,
      expected: ['data.trends', 'data.period']
    }
  ];
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    const result = await testEndpoint(
      endpoint.name,
      endpoint.url,
      endpoint.expected,
      { skip: endpoint.skip, skipReason: endpoint.skipReason }
    );
    results.push({ ...endpoint, result });
    console.log(''); // Empty line between tests
  }
  
  // Summary
  console.log(`${colors.bright}${colors.yellow}=== SUMMARY ===${colors.reset}\n`);
  
  const working = results.filter(r => r.result.status === 'working');
  const notWorking = results.filter(r => r.result.status !== 'working' && r.result.status !== 'skipped');
  const skipped = results.filter(r => r.result.status === 'skipped');
  
  console.log(`${colors.green}✓ Working endpoints: ${working.length}/${results.length - skipped.length}${colors.reset}`);
  working.forEach(r => {
    console.log(`  ${colors.green}✓ ${r.name}${colors.reset}`);
  });
  
  const totalExecuted = results.length - skipped.length;
  console.log(`\n${colors.red}✗ Not working endpoints: ${notWorking.length}/${totalExecuted}${colors.reset}`);
  notWorking.forEach(r => {
    console.log(`  ${colors.red}✗ ${r.name}${colors.reset}`);
    if (r.result.status === 'error') {
      console.log(`    Status: ${r.result.response.status}`);
    } else if (r.result.status === 'failed') {
      console.log(`    Error: ${r.result.error}`);
    }
  });
  
  if (skipped.length > 0) {
    console.log(`\n${colors.yellow}⚠ Skipped endpoints: ${skipped.length}${colors.reset}`);
    skipped.forEach(r => {
      console.log(`  ${colors.yellow}⚠ ${r.name} - ${r.result.reason || 'Skipped'}${colors.reset}`);
    });
  }

  const successRate = totalExecuted > 0 ? ((working.length / totalExecuted) * 100).toFixed(1) : '0.0';
  console.log(`\n${colors.bright}Success Rate: ${successRate}%${colors.reset}`);
  
  if (notWorking.length > 0) {
    console.log(`\n${colors.yellow}${colors.bright}⚠️  Backend team needs to fix ${notWorking.length} failing endpoints${colors.reset}`);
  } else {
    console.log(`\n${colors.green}${colors.bright}🎉 All overview endpoints are working!${colors.reset}`);
  }
}

// Run the tests
main().catch(console.error);
