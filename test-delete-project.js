// Test script to verify delete project functionality
// Run this in the browser console after the app loads

console.log('🧪 Testing delete project functionality...');

// Wait for the app to load
setTimeout(async () => {
  try {
    // Check if we're authenticated
    if (window.devLogin) {
      console.log('🔐 Logging in test user...');
      await window.devLogin();

      // Wait a moment for the app to update
      setTimeout(() => {
        console.log('✅ Login successful!');
        console.log('📋 You can now test the delete project button.');
        console.log('💡 Click the delete button on any project to test.');
        console.log('🔍 Check the browser console for API calls.');
      }, 1000);
    } else {
      console.log('❌ Development login function not available');
      console.log('💡 Make sure you are in development mode');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}, 2000);

// Monitor API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 API Call:', args[0], args[1]?.method || 'GET');
  return originalFetch.apply(this, args);
};
