#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Cleaning Vite cache and fixing dependency issues...\n');

const cleanPaths = [
  'dist',
  'node_modules/.vite',
  '.vite',
  'coverage',
  '*.log'
];

console.log('📁 Removing cache directories:');
cleanPaths.forEach(cleanPath => {
  const fullPath = path.join(__dirname, cleanPath);
  if (fs.existsSync(fullPath)) {
    try {
      if (fs.lstatSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`   ✅ Removed: ${cleanPath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`   ✅ Removed: ${cleanPath}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Could not remove: ${cleanPath} (${error.message})`);
    }
  } else {
    console.log(`   ℹ️  Not found: ${cleanPath}`);
  }
});

// Check for package-lock.json and node_modules
const packageLockPath = path.join(__dirname, 'package-lock.json');
const nodeModulesPath = path.join(__dirname, 'node_modules');

console.log('\n📦 Checking dependencies:');

if (fs.existsSync(packageLockPath)) {
  console.log('   📄 package-lock.json found');
} else {
  console.log('   ⚠️  package-lock.json not found');
}

if (fs.existsSync(nodeModulesPath)) {
  console.log('   📁 node_modules found');
} else {
  console.log('   ⚠️  node_modules not found');
}

console.log('\n🔧 Recommended actions:');

if (!fs.existsSync(nodeModulesPath)) {
  console.log('1. Run: npm install');
} else {
  console.log('1. Run: npm run clean:all (to completely reinstall dependencies)');
}

console.log('2. Run: npm run dev');
console.log('3. Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)');

console.log('\n💡 Additional troubleshooting:');
console.log('- If issues persist, try: npm run clean:all');
console.log('- Check browser console for specific error messages');
console.log('- Ensure no other dev servers are running on port 5173');
console.log('- Try a different browser or incognito mode');

console.log('\n🚀 Ready to restart development server!');
