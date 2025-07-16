// Performance test script for the application
// Run this in the browser console after the app loads

const performanceTest = {
  async runQuickTest() {
    console.log('🚀 Running quick performance test...');

    const startTime = performance.now();

    // Test health check
    try {
      const healthStart = performance.now();
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      const healthTime = performance.now() - healthStart;
      console.log(`✅ Health check: ${healthTime.toFixed(2)}ms`);

      if (healthData.status === 'ok') {
        console.log('✅ Backend is healthy');
      } else {
        console.log('❌ Backend health check failed');
      }
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    // Test dashboard data if authenticated
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const dashboardStart = performance.now();
        const dashboardResponse = await fetch('/api/dashboard/initial-data', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const dashboardData = await dashboardResponse.json();
        const dashboardTime = performance.now() - dashboardStart;
        console.log(`✅ Dashboard data: ${dashboardTime.toFixed(2)}ms`);

        if (dashboardData.success) {
          console.log(`📊 Loaded ${dashboardData.data?.tasks?.length || 0} tasks`);
          console.log(`📊 Loaded ${dashboardData.data?.projects?.length || 0} projects`);
        }
      } catch (error) {
        console.log('❌ Dashboard data failed:', error.message);
      }
    }

    const totalTime = performance.now() - startTime;
    console.log(`⏱️  Total test time: ${totalTime.toFixed(2)}ms`);

    if (totalTime < 2000) {
      console.log('🎉 Excellent performance!');
    } else if (totalTime < 5000) {
      console.log('👍 Good performance');
    } else {
      console.log('⚠️  Performance could be improved');
    }
  },

  async runAuthTest() {
    console.log('🔐 Testing authentication performance...');

    const authStart = performance.now();

    // Test token validation
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const validateStart = performance.now();
        const validateResponse = await fetch('/api/auth/validate', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const validateTime = performance.now() - validateStart;
        console.log(`✅ Token validation: ${validateTime.toFixed(2)}ms`);

        if (validateResponse.ok) {
          console.log('✅ Token is valid');
        } else {
          console.log('❌ Token validation failed');
        }
      } catch (error) {
        console.log('❌ Token validation error:', error.message);
      }
    } else {
      console.log('ℹ️  No token found, skipping validation test');
    }

    const authTime = performance.now() - authStart;
    console.log(`🔐 Auth test total: ${authTime.toFixed(2)}ms`);
  },

  async runNetworkTest() {
    console.log('🌐 Testing network latency...');

    const latencies = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      try {
        await fetch('/api/health');
        const latency = performance.now() - start;
        latencies.push(latency);
        console.log(`🌐 Ping ${i + 1}: ${latency.toFixed(2)}ms`);
      } catch (error) {
        console.log(`❌ Ping ${i + 1} failed: ${error.message}`);
      }
    }

    if (latencies.length > 0) {
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      console.log(`🌐 Average latency: ${avgLatency.toFixed(2)}ms`);

      if (avgLatency < 100) {
        console.log('🚀 Excellent network performance');
      } else if (avgLatency < 500) {
        console.log('👍 Good network performance');
      } else {
        console.log('⚠️  Network performance could be improved');
      }
    }
  },

  logPerformanceTips() {
    console.log('\n💡 Performance Tips:');
    console.log('   - Use batch requests when possible');
    console.log('   - Implement proper caching');
    console.log('   - Optimize database queries');
    console.log('   - Reduce bundle size');
    console.log('   - Use lazy loading for components');
    console.log('   - Minimize API calls');
  }
};

// Make it globally available
window.performanceTest = performanceTest;

// Auto-run quick test after page loads
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('🔍 Performance test available. Run: performanceTest.runQuickTest()');
    console.log('📊 Available tests:');
    console.log('   - performanceTest.runQuickTest()');
    console.log('   - performanceTest.runAuthTest()');
    console.log('   - performanceTest.runNetworkTest()');
    console.log('   - performanceTest.logPerformanceTips()');
  }, 3000);
});

export default performanceTest;
