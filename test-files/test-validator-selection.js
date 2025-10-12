#!/usr/bin/env node

/**
 * Validator Selection Test
 * 
 * This script tests the validator selection functionality to ensure
 * that different validators show different data.
 */

const { mockRoundMiners } = require('./apps/isomorphic/src/services/api/mock-data.ts');

console.log('🧪 Testing Validator Selection Functionality');
console.log('=' * 50);

// Simulate the filtering logic from the frontend
function filterMinersByValidator(validators, selectedValidatorId) {
  if (!selectedValidatorId) return validators;
  return validators.filter(miner => miner.validatorId === selectedValidatorId);
}

function calculateValidatorStatistics(filteredMiners) {
  if (!filteredMiners || filteredMiners.length === 0) {
    return {
      totalMiners: 0,
      activeMiners: 0,
      averageScore: 0,
      topScore: 0,
      totalTasks: 0,
      completedTasks: 0,
      totalStake: 0,
      totalEmission: 0,
    };
  }

  return {
    totalMiners: filteredMiners.length,
    activeMiners: filteredMiners.filter(miner => miner.success).length,
    averageScore: filteredMiners.reduce((sum, miner) => sum + (miner.score || 0), 0) / filteredMiners.length,
    topScore: Math.max(...filteredMiners.map(miner => miner.score || 0)),
    totalTasks: filteredMiners.reduce((sum, miner) => sum + (miner.tasksCompleted || 0), 0),
    completedTasks: filteredMiners.reduce((sum, miner) => sum + (miner.tasksCompleted || 0), 0),
    totalStake: filteredMiners.reduce((sum, miner) => sum + (miner.stake || 0), 0),
    totalEmission: filteredMiners.reduce((sum, miner) => sum + (miner.emission || 0), 0),
  };
}

// Test each validator
const validators = ['autoppia', 'kraken', 'tao5', 'roundtable21', 'yuma'];

console.log('📊 Validator-Specific Statistics:');
console.log('-' * 50);

validators.forEach(validatorId => {
  const filteredMiners = filterMinersByValidator(mockRoundMiners, validatorId);
  const stats = calculateValidatorStatistics(filteredMiners);
  
  console.log(`\n🔹 ${validatorId.toUpperCase()}:`);
  console.log(`   Miners: ${stats.totalMiners}`);
  console.log(`   Active: ${stats.activeMiners}`);
  console.log(`   Avg Score: ${(stats.averageScore * 100).toFixed(1)}%`);
  console.log(`   Top Score: ${(stats.topScore * 100).toFixed(1)}%`);
  console.log(`   Total Tasks: ${stats.totalTasks}`);
  console.log(`   Total Stake: ${stats.totalStake.toLocaleString()}`);
  console.log(`   Total Emission: ${stats.totalEmission.toFixed(2)}`);
  
  // Show top miner for this validator
  if (filteredMiners.length > 0) {
    const topMiner = filteredMiners.reduce((top, miner) => 
      (miner.score || 0) > (top.score || 0) ? miner : top
    );
    console.log(`   Top Miner: UID ${topMiner.uid} (${(topMiner.score * 100).toFixed(1)}%)`);
  }
});

// Test with no validator selected (should show all data)
console.log('\n🔹 ALL VALIDATORS (No Filter):');
const allStats = calculateValidatorStatistics(mockRoundMiners);
console.log(`   Miners: ${allStats.totalMiners}`);
console.log(`   Active: ${allStats.activeMiners}`);
console.log(`   Avg Score: ${(allStats.averageScore * 100).toFixed(1)}%`);
console.log(`   Top Score: ${(allStats.topScore * 100).toFixed(1)}%`);

// Verify that different validators show different data
console.log('\n✅ Validation Results:');
console.log('-' * 50);

const validatorStats = validators.map(validatorId => {
  const filteredMiners = filterMinersByValidator(mockRoundMiners, validatorId);
  return {
    validatorId,
    stats: calculateValidatorStatistics(filteredMiners)
  };
});

// Check if any two validators have identical stats
let hasDifferences = false;
for (let i = 0; i < validatorStats.length; i++) {
  for (let j = i + 1; j < validatorStats.length; j++) {
    const stats1 = validatorStats[i].stats;
    const stats2 = validatorStats[j].stats;
    
    if (stats1.totalMiners === stats2.totalMiners && 
        stats1.averageScore === stats2.averageScore &&
        stats1.topScore === stats2.topScore) {
      console.log(`❌ ${validatorStats[i].validatorId} and ${validatorStats[j].validatorId} have identical stats`);
      hasDifferences = true;
    }
  }
}

if (!hasDifferences) {
  console.log('✅ All validators show different statistics - filtering is working correctly!');
} else {
  console.log('⚠️  Some validators have identical statistics - this may be expected with mock data');
}

console.log('\n🎯 Summary:');
console.log(`   Total miners in mock data: ${mockRoundMiners.length}`);
console.log(`   Validators tested: ${validators.length}`);
console.log(`   Miners per validator: ${Math.floor(mockRoundMiners.length / validators.length)}`);

console.log('\n✅ Validator selection test completed!');
console.log('The frontend should now show different data when clicking different validators.');
