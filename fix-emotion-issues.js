#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Diagnosing @emotion/react multiple instances issue...\n');

// Check for multiple @emotion/react installations
const nodeModulesPath = path.join(__dirname, 'node_modules');
const emotionReactPath = path.join(nodeModulesPath, '@emotion/react');

if (fs.existsSync(emotionReactPath)) {
  console.log('✅ @emotion/react found in node_modules');

  // Check package.json for version
  const packageJsonPath = path.join(emotionReactPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`📦 Version: ${packageJson.version}`);
  }
} else {
  console.log('❌ @emotion/react not found in node_modules');
}

// Check for duplicate installations
const findDuplicates = (dir, target = '@emotion/react') => {
  const duplicates = [];

  const scan = (currentDir) => {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        const fullPath = path.join(currentDir, item.name);

        if (item.name === target) {
          duplicates.push(fullPath);
        } else if (item.name !== 'node_modules' && !item.name.startsWith('.')) {
          scan(fullPath);
        }
      }
    }
  };

  scan(dir);
  return duplicates;
};

const duplicates = findDuplicates(nodeModulesPath);
if (duplicates.length > 1) {
  console.log('⚠️  Multiple @emotion/react installations found:');
  duplicates.forEach(dup => console.log(`   - ${dup}`));
} else {
  console.log('✅ No duplicate @emotion/react installations found');
}

// Check Vite cache
const viteCachePath = path.join(nodeModulesPath, '.vite');
if (fs.existsSync(viteCachePath)) {
  console.log('🗂️  Vite cache found');
} else {
  console.log('📁 No Vite cache found');
}

console.log('\n🔧 Recommended fixes:');
console.log('1. Run: npm run clean:all');
console.log('2. Run: npm install');
console.log('3. Run: npm run dev');
console.log('\nThis will clear all caches and reinstall dependencies to fix the multiple instances issue.');
