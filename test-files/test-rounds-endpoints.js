#!/usr/bin/env node

/**
 * Rounds API Endpoints Performance Test
 * 
 * This script tests all rounds endpoints and measures their response times.
 * It provides detailed timing information and identifies slow endpoints.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const ROUND_ID = 20; // Test with round ID 20
const TIMEOUT = 10000; // 10 seconds timeout
const RETRIES = 3; // Number of retries for failed requests

// Test results storage
const results = {
  summary: {
    totalTests: 0,
    successfulTests: 0,
    failedTests: 0,
    averageResponseTime: 0,
    fastestEndpoint: null,
    slowestEndpoint: null,
    startTime: new Date(),
    endTime: null
  },
  endpoints: []
};

// Helper function to make HTTP requests with timing
async function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Rounds-API-Test/1.0'
      },
      timeout: TIMEOUT
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
            headers: res.headers,
            success: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            responseTime: responseTime,
            data: responseData,
            headers: res.headers,
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test function with retries
async function testEndpoint(name, url, method = 'GET', data = null) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   URL: ${url}`);
  
  let lastError = null;
  
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const result = await makeRequest(url, method, data);
      
      const endpointResult = {
        name: name,
        url: url,
        method: method,
        attempt: attempt,
        success: result.success,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        dataSize: result.data ? JSON.stringify(result.data).length : 0,
        headers: result.headers,
        timestamp: new Date().toISOString()
      };

      if (result.parseError) {
        endpointResult.parseError = result.parseError;
      }

      results.endpoints.push(endpointResult);
      results.summary.totalTests++;
      
      if (result.success) {
        results.summary.successfulTests++;
        console.log(`   ✅ Success (${result.responseTime}ms) - Status: ${result.statusCode}`);
        if (result.data) {
          console.log(`   📊 Data size: ${endpointResult.dataSize} bytes`);
        }
        return endpointResult;
      } else {
        console.log(`   ❌ Failed (${result.responseTime}ms) - Status: ${result.statusCode}`);
        lastError = result;
      }
      
    } catch (error) {
      console.log(`   ⚠️  Attempt ${attempt} failed: ${error.error || error.message}`);
      lastError = error;
      
      if (attempt < RETRIES) {
        console.log(`   🔄 Retrying... (${attempt + 1}/${RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
  }
  
  // All attempts failed
  results.summary.failedTests++;
  const failedResult = {
    name: name,
    url: url,
    method: method,
    success: false,
    error: lastError.error || lastError.message,
    responseTime: lastError.responseTime || 0,
    timestamp: new Date().toISOString()
  };
  
  results.endpoints.push(failedResult);
  console.log(`   💥 All attempts failed: ${failedResult.error}`);
  return failedResult;
}

// Define all endpoints to test
const endpoints = [
  // Basic rounds endpoints
  {
    name: 'Get Current Round',
    url: `${BASE_URL}/api/v1/rounds/current`,
    method: 'GET'
  },
  {
    name: 'Get All Rounds (Default)',
    url: `${BASE_URL}/api/v1/rounds`,
    method: 'GET'
  },
  {
    name: 'Get All Rounds (Page 1, Limit 10)',
    url: `${BASE_URL}/api/v1/rounds?page=1&limit=10`,
    method: 'GET'
  },
  {
    name: 'Get All Rounds (Sorted by ID)',
    url: `${BASE_URL}/api/v1/rounds?sortBy=id&sortOrder=desc`,
    method: 'GET'
  },
  {
    name: 'Get All Rounds (Active Status)',
    url: `${BASE_URL}/api/v1/rounds?status=active`,
    method: 'GET'
  },
  
  // Specific round endpoints
  {
    name: 'Get Round Details',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}`,
    method: 'GET'
  },
  {
    name: 'Get Round Statistics',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/statistics`,
    method: 'GET'
  },
  {
    name: 'Get Round Summary',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/summary`,
    method: 'GET'
  },
  {
    name: 'Get Round Progress',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/progress`,
    method: 'GET'
  },
  {
    name: 'Get Round Timeline',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/timeline`,
    method: 'GET'
  },
  
  // Miners endpoints
  {
    name: 'Get Round Miners (Default)',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/miners`,
    method: 'GET'
  },
  {
    name: 'Get Round Miners (Page 1, Limit 25)',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/miners?page=1&limit=25`,
    method: 'GET'
  },
  {
    name: 'Get Round Miners (Sorted by Score)',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/miners?sortBy=score&sortOrder=desc`,
    method: 'GET'
  },
  {
    name: 'Get Top Miners',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/miners/top`,
    method: 'GET'
  },
  {
    name: 'Get Specific Miner (UID 1)',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/miners/1`,
    method: 'GET'
  },
  
  // Validators endpoints
  {
    name: 'Get Round Validators',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/validators`,
    method: 'GET'
  },
  {
    name: 'Get Specific Validator (ID 1)',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/validators/1`,
    method: 'GET'
  },
  
  // Activity endpoints
  {
    name: 'Get Round Activity (Default)',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/activity`,
    method: 'GET'
  },
  {
    name: 'Get Round Activity (Limit 50)',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/activity?limit=50`,
    method: 'GET'
  },
  {
    name: 'Get Round Activity (Recent)',
    url: `${BASE_URL}/api/v1/rounds/${ROUND_ID}/activity?type=recent`,
    method: 'GET'
  },
  
  // Compare endpoint
  {
    name: 'Compare Rounds',
    url: `${BASE_URL}/api/v1/rounds/compare`,
    method: 'POST',
    data: {
      roundIds: [18, 19, 20]
    }
  }
];

// Main test function
async function runTests() {
  console.log('🚀 Starting Rounds API Endpoints Performance Test');
  console.log(`📡 Base URL: ${BASE_URL}`);
  console.log(`🎯 Test Round ID: ${ROUND_ID}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log(`🔄 Retries: ${RETRIES}`);
  console.log(`📊 Total Endpoints: ${endpoints.length}`);
  console.log('=' * 60);

  const startTime = Date.now();
  
  // Run all tests
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.name, endpoint.url, endpoint.method, endpoint.data);
  }
  
  const endTime = Date.now();
  results.summary.endTime = new Date();
  results.summary.totalTestTime = endTime - startTime;
  
  // Calculate statistics
  const successfulTests = results.endpoints.filter(e => e.success);
  if (successfulTests.length > 0) {
    const responseTimes = successfulTests.map(e => e.responseTime);
    results.summary.averageResponseTime = Math.round(
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    );
    
    const fastest = successfulTests.reduce((min, e) => 
      e.responseTime < min.responseTime ? e : min
    );
    const slowest = successfulTests.reduce((max, e) => 
      e.responseTime > max.responseTime ? e : max
    );
    
    results.summary.fastestEndpoint = {
      name: fastest.name,
      responseTime: fastest.responseTime
    };
    results.summary.slowestEndpoint = {
      name: slowest.name,
      responseTime: slowest.responseTime
    };
  }
  
  // Generate report
  generateReport();
}

// Generate comprehensive report
function generateReport() {
  console.log('\n' + '=' * 60);
  console.log('📊 ROUNDS API PERFORMANCE TEST REPORT');
  console.log('=' * 60);
  
  // Summary
  console.log('\n📈 SUMMARY:');
  console.log(`   Total Tests: ${results.summary.totalTests}`);
  console.log(`   Successful: ${results.summary.successfulTests} (${Math.round(results.summary.successfulTests / results.summary.totalTests * 100)}%)`);
  console.log(`   Failed: ${results.summary.failedTests} (${Math.round(results.summary.failedTests / results.summary.totalTests * 100)}%)`);
  console.log(`   Total Test Time: ${results.summary.totalTestTime}ms`);
  console.log(`   Average Response Time: ${results.summary.averageResponseTime}ms`);
  
  if (results.summary.fastestEndpoint) {
    console.log(`   Fastest Endpoint: ${results.summary.fastestEndpoint.name} (${results.summary.fastestEndpoint.responseTime}ms)`);
  }
  if (results.summary.slowestEndpoint) {
    console.log(`   Slowest Endpoint: ${results.summary.slowestEndpoint.name} (${results.summary.slowestEndpoint.responseTime}ms)`);
  }
  
  // Performance categories
  const successfulTests = results.endpoints.filter(e => e.success);
  const fastTests = successfulTests.filter(e => e.responseTime < 500);
  const mediumTests = successfulTests.filter(e => e.responseTime >= 500 && e.responseTime < 2000);
  const slowTests = successfulTests.filter(e => e.responseTime >= 2000);
  
  console.log('\n⚡ PERFORMANCE CATEGORIES:');
  console.log(`   Fast (< 500ms): ${fastTests.length} endpoints`);
  console.log(`   Medium (500ms - 2s): ${mediumTests.length} endpoints`);
  console.log(`   Slow (> 2s): ${slowTests.length} endpoints`);
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  console.log('-' * 60);
  
  results.endpoints.forEach((endpoint, index) => {
    const status = endpoint.success ? '✅' : '❌';
    const time = endpoint.responseTime ? `${endpoint.responseTime}ms` : 'N/A';
    const size = endpoint.dataSize ? `${endpoint.dataSize}B` : 'N/A';
    
    console.log(`${(index + 1).toString().padStart(2)}. ${status} ${endpoint.name}`);
    console.log(`    Time: ${time} | Size: ${size} | Status: ${endpoint.statusCode || 'N/A'}`);
    
    if (endpoint.error) {
      console.log(`    Error: ${endpoint.error}`);
    }
  });
  
  // Failed tests summary
  const failedTests = results.endpoints.filter(e => !e.success);
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    console.log('-' * 60);
    failedTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.name}`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Error: ${test.error}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (results.summary.failedTests > 0) {
    console.log(`   • ${results.summary.failedTests} endpoints are not responding - check backend implementation`);
  }
  if (slowTests.length > 0) {
    console.log(`   • ${slowTests.length} endpoints are slow (>2s) - consider optimization`);
    slowTests.forEach(test => {
      console.log(`     - ${test.name}: ${test.responseTime}ms`);
    });
  }
  if (results.summary.averageResponseTime > 1000) {
    console.log(`   • Average response time is high (${results.summary.averageResponseTime}ms) - consider caching`);
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('   1. Fix any failed endpoints in the backend');
  console.log('   2. Optimize slow endpoints');
  console.log('   3. Implement caching for frequently accessed data');
  console.log('   4. Consider pagination for large datasets');
  console.log('   5. Monitor response times in production');
  
  console.log('\n' + '=' * 60);
  console.log('✅ Test completed successfully!');
  console.log('=' * 60);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception:', error);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, makeRequest };
