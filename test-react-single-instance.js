#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing React single instance...\n');

// Check for multiple React installations
const nodeModulesPath = path.join(__dirname, 'node_modules');
const reactPath = path.join(nodeModulesPath, 'react');
const reactDomPath = path.join(nodeModulesPath, 'react-dom');

console.log('📦 Checking React installations:');

if (fs.existsSync(reactPath)) {
  const reactPackageJson = JSON.parse(fs.readFileSync(path.join(reactPath, 'package.json'), 'utf8'));
  console.log(`   ✅ React: ${reactPackageJson.version}`);
} else {
  console.log('   ❌ React not found');
}

if (fs.existsSync(reactDomPath)) {
  const reactDomPackageJson = JSON.parse(fs.readFileSync(path.join(reactDomPath, 'package.json'), 'utf8'));
  console.log(`   ✅ React-DOM: ${reactDomPackageJson.version}`);
} else {
  console.log('   ❌ React-DOM not found');
}

// Check for duplicate React installations in nested node_modules
const findReactInstances = (dir) => {
  const instances = [];

  const scan = (currentDir) => {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        const fullPath = path.join(currentDir, item.name);

        if (item.name === 'react' || item.name === 'react-dom') {
          instances.push(fullPath);
        } else if (item.name !== 'node_modules' && !item.name.startsWith('.')) {
          scan(fullPath);
        }
      }
    }
  };

  scan(dir);
  return instances;
};

const reactInstances = findReactInstances(nodeModulesPath);
const reactInstancesCount = reactInstances.filter(p => p.includes('/react/') && !p.includes('/react-dom/')).length;
const reactDomInstancesCount = reactInstances.filter(p => p.includes('/react-dom/')).length;

console.log(`\n📊 React instances found: ${reactInstancesCount}`);
console.log(`📊 React-DOM instances found: ${reactDomInstancesCount}`);

if (reactInstancesCount > 1) {
  console.log('⚠️  Multiple React instances detected!');
  reactInstances.filter(p => p.includes('/react/')).forEach(instance => {
    console.log(`   - ${instance}`);
  });
} else {
  console.log('✅ Single React instance detected');
}

if (reactDomInstancesCount > 1) {
  console.log('⚠️  Multiple React-DOM instances detected!');
  reactInstances.filter(p => p.includes('/react-dom/')).forEach(instance => {
    console.log(`   - ${instance}`);
  });
} else {
  console.log('✅ Single React-DOM instance detected');
}

// Check Vite cache
const viteCachePath = path.join(nodeModulesPath, '.vite');
if (fs.existsSync(viteCachePath)) {
  console.log('\n🗂️  Vite cache exists');
} else {
  console.log('\n📁 No Vite cache found');
}

console.log('\n🔧 If multiple instances are found, run:');
console.log('   npm run clean:all');
console.log('   npm install');
console.log('   npm run dev');
