#!/usr/bin/env node

/**
 * Quick Rounds API Endpoints Test
 * 
 * A simplified script for quickly testing individual endpoints
 * Usage: node quick-test-endpoints.js [endpoint-name]
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const ROUND_ID = 20;

// Available endpoints for quick testing
const endpoints = {
  'current': {
    name: 'Current Round',
    url: `${BASE_URL}/api/v1/rounds/current`
  },
  'rounds': {
    name: 'All Rounds',
    url: `${BASE_URL}/api/v1/rounds`
  },
  'round': {
    name: 'Round Details',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}`
  },
  'statistics': {
    name: 'Round Statistics',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/statistics`
  },
  'miners': {
    name: 'Round Miners',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/miners`
  },
  'validators': {
    name: 'Round Validators',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/validators`
  },
  'activity': {
    name: 'Round Activity',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/activity`
  },
  'progress': {
    name: 'Round Progress',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/progress`
  }
};

// Helper function to make HTTP requests with timing
async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Quick-API-Test/1.0'
      },
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            statusCode: res.statusCode,
            responseTime: responseTime,
            data: parsedData,
            dataSize: responseData.length,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            responseTime: responseTime,
            data: responseData,
            dataSize: responseData.length,
            success: res.statusCode >= 200 && res.statusCode < 300,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      reject({
        error: error.message,
        responseTime: responseTime,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      reject({
        error: 'Request timeout',
        responseTime: responseTime,
        success: false
      });
    });

    req.end();
  });
}

// Test a single endpoint
async function testEndpoint(key, endpoint) {
  console.log(`\n🧪 Testing: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.url}`);
  
  try {
    const result = await makeRequest(endpoint.url);
    
    const status = result.success ? '✅' : '❌';
    const time = `${result.responseTime}ms`;
    const size = `${result.dataSize}B`;
    
    console.log(`   ${status} Status: ${result.statusCode} | Time: ${time} | Size: ${size}`);
    
    if (result.parseError) {
      console.log(`   ⚠️  Parse Error: ${result.parseError}`);
    }
    
    if (result.success && result.data) {
      console.log(`   📊 Response preview:`);
      console.log(`      ${JSON.stringify(result.data, null, 2).substring(0, 200)}...`);
    }
    
    return result;
    
  } catch (error) {
    console.log(`   💥 Error: ${error.error || error.message}`);
    return { success: false, error: error.error || error.message };
  }
}

// Test all endpoints
async function testAllEndpoints() {
  console.log('🚀 Quick Rounds API Test');
  console.log(`📡 Base URL: ${BASE_URL}`);
  console.log(`🎯 Test Round ID: ${ROUND_ID}`);
  console.log('=' * 50);
  
  const results = [];
  
  for (const [key, endpoint] of Object.entries(endpoints)) {
    const result = await testEndpoint(key, endpoint);
    results.push({ key, endpoint, result });
  }
  
  // Summary
  const successful = results.filter(r => r.result.success).length;
  const failed = results.filter(r => !r.result.success).length;
  const avgTime = results
    .filter(r => r.result.success && r.result.responseTime)
    .reduce((sum, r) => sum + r.result.responseTime, 0) / successful;
  
  console.log('\n' + '=' * 50);
  console.log('📊 SUMMARY:');
  console.log(`   Successful: ${successful}/${results.length}`);
  console.log(`   Failed: ${failed}/${results.length}`);
  console.log(`   Average Time: ${Math.round(avgTime)}ms`);
  
  if (failed > 0) {
    console.log('\n❌ Failed endpoints:');
    results.filter(r => !r.result.success).forEach(r => {
      console.log(`   • ${r.endpoint.name}: ${r.result.error}`);
    });
  }
  
  console.log('\n✅ Test completed!');
}

// Test specific endpoint
async function testSpecificEndpoint(endpointKey) {
  if (!endpoints[endpointKey]) {
    console.log(`❌ Unknown endpoint: ${endpointKey}`);
    console.log('Available endpoints:', Object.keys(endpoints).join(', '));
    process.exit(1);
  }
  
  console.log('🚀 Quick Single Endpoint Test');
  console.log(`📡 Base URL: ${BASE_URL}`);
  console.log('=' * 50);
  
  const result = await testEndpoint(endpointKey, endpoints[endpointKey]);
  
  if (result.success) {
    console.log('\n✅ Test successful!');
  } else {
    console.log('\n❌ Test failed!');
    process.exit(1);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    await testAllEndpoints();
  } else {
    await testSpecificEndpoint(args[0]);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user');
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testEndpoint, testAllEndpoints, testSpecificEndpoint };
