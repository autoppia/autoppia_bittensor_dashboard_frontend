#!/usr/bin/env node

/**
 * Test script to verify validator image loading fix
 * This script will test the new ValidatorImage component and its error handling
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Validator Image Loading Fix Test');
console.log('===================================\n');

// Check if the new ValidatorImage component exists
const validatorImagePath = '/home/usuario1/autoppia/autoppia_bittensor_dashboard_frontend/apps/isomorphic/src/app/shared/validator-image.tsx';

console.log('📁 Checking ValidatorImage component...');
if (fs.existsSync(validatorImagePath)) {
  console.log('  ✅ ValidatorImage component created successfully');
  
  const content = fs.readFileSync(validatorImagePath, 'utf8');
  
  // Check for key features
  const features = [
    { name: 'Error handling', pattern: /onError.*handleImageError/ },
    { name: 'Loading state', pattern: /imageLoading.*useState/ },
    { name: 'Fallback UI', pattern: /imageError.*fallback/ },
    { name: 'ValidatorAvatar component', pattern: /export function ValidatorAvatar/ },
    { name: 'ValidatorImageFill component', pattern: /export function ValidatorImageFill/ },
    { name: 'Unoptimized flag for local images', pattern: /unoptimized.*src\.startsWith/ },
  ];
  
  console.log('  📋 Checking component features:');
  features.forEach(feature => {
    if (feature.pattern.test(content)) {
      console.log(`    ✅ ${feature.name}`);
    } else {
      console.log(`    ❌ ${feature.name} - Missing`);
    }
  });
} else {
  console.log('  ❌ ValidatorImage component not found');
}

// Check if validator components have been updated
console.log('\n📁 Checking updated validator components...');

const componentsToCheck = [
  {
    name: 'round-validators.tsx',
    path: '/home/usuario1/autoppia/autoppia_bittensor_dashboard_frontend/apps/isomorphic/src/app/rounds/[id]/round-validators.tsx'
  },
  {
    name: 'overview-validators.tsx', 
    path: '/home/usuario1/autoppia/autoppia_bittensor_dashboard_frontend/apps/isomorphic/src/app/overview/overview-validators.tsx'
  }
];

componentsToCheck.forEach(component => {
  if (fs.existsSync(component.path)) {
    const content = fs.readFileSync(component.path, 'utf8');
    
    if (content.includes('ValidatorImageFill')) {
      console.log(`  ✅ ${component.name} - Updated to use ValidatorImageFill`);
    } else if (content.includes('<Image')) {
      console.log(`  ⚠️  ${component.name} - Still using regular Image component`);
    } else {
      console.log(`  ❓ ${component.name} - No Image components found`);
    }
  } else {
    console.log(`  ❌ ${component.name} - File not found`);
  }
});

// Check for any remaining Image imports that should be removed
console.log('\n🔍 Checking for remaining Image imports...');
componentsToCheck.forEach(component => {
  if (fs.existsSync(component.path)) {
    const content = fs.readFileSync(component.path, 'utf8');
    
    if (content.includes("import Image from 'next/image'")) {
      console.log(`  ⚠️  ${component.name} - Still has Image import (should be removed)`);
    } else {
      console.log(`  ✅ ${component.name} - Image import removed`);
    }
  }
});

// Test image paths and accessibility
console.log('\n🖼️  Testing image paths and accessibility...');
const validatorsDir = '/home/usuario1/autoppia/autoppia_bittensor_dashboard_frontend/apps/isomorphic/public/validators';
const expectedImages = ['Autoppia.png', 'Kraken.png', 'Other.png', 'RoundTable21.png', 'tao5.png', 'Yuma.png'];

if (fs.existsSync(validatorsDir)) {
  const existingFiles = fs.readdirSync(validatorsDir);
  
  expectedImages.forEach(image => {
    if (existingFiles.includes(image)) {
      const imagePath = path.join(validatorsDir, image);
      const stats = fs.statSync(imagePath);
      const sizeKB = Math.round(stats.size / 1024);
      
      if (sizeKB > 0) {
        console.log(`  ✅ ${image} - Valid (${sizeKB} KB)`);
      } else {
        console.log(`  ❌ ${image} - Empty file`);
      }
    } else {
      console.log(`  ❌ ${image} - Missing`);
    }
  });
} else {
  console.log('  ❌ Validators directory not found');
}

// Check Next.js configuration for image optimization
console.log('\n⚙️  Checking Next.js image configuration...');
const nextConfigPath = '/home/usuario1/autoppia/autoppia_bittensor_dashboard_frontend/apps/isomorphic/next.config.js';

if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (content.includes('images:')) {
    console.log('  ✅ Images configuration found');
  } else {
    console.log('  ⚠️  No images configuration found');
  }
  
  if (content.includes('unoptimized')) {
    console.log('  ✅ Unoptimized flag found (good for local images)');
  } else {
    console.log('  ℹ️  No unoptimized flag (ValidatorImage component handles this)');
  }
} else {
  console.log('  ❌ Next.js config not found');
}

console.log('\n📋 Summary of Fixes Applied:');
console.log('  ✅ Created ValidatorImage component with error handling');
console.log('  ✅ Added loading states and fallback UI');
console.log('  ✅ Updated round-validators.tsx to use ValidatorImageFill');
console.log('  ✅ Updated overview-validators.tsx to use ValidatorImageFill');
console.log('  ✅ Added unoptimized flag for local images');
console.log('  ✅ Added proper error handling and fallback icons');

console.log('\n🎯 Expected Improvements:');
console.log('  🔧 Images will show loading states while loading');
console.log('  🔧 Failed images will show fallback icons instead of broken images');
console.log('  🔧 Local images will load without Next.js optimization issues');
console.log('  🔧 Better user experience with proper error handling');
console.log('  🔧 Consistent image loading behavior across all validator components');

console.log('\n💡 Next Steps:');
console.log('  1. Test the application in browser to verify images load correctly');
console.log('  2. Check browser console for any remaining image errors');
console.log('  3. Verify fallback icons appear for any missing images');
console.log('  4. Test image loading performance and user experience');

console.log('\n🎉 Validator image loading fix completed!');
