// Enhanced performance test script
// Run this in the browser console to test loading times

const performanceTest = {
  startTime: null,
  endTime: null,
  metrics: {},

  start() {
    this.startTime = performance.now();
    console.log('🚀 Performance test started...');
    this.metrics = {};
  },

  end() {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;
    console.log(`⏱️  Total loading time: ${duration.toFixed(2)}ms`);

    if (duration < 2000) {
      console.log('✅ Excellent performance!');
    } else if (duration < 5000) {
      console.log('⚠️  Good performance, but could be better');
    } else {
      console.log('❌ Performance needs improvement');
    }

    // Log all metrics
    console.log('📊 Performance Metrics:', this.metrics);
    return duration;
  },

  measure(name, fn) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    this.metrics[name] = duration.toFixed(2) + 'ms';
    console.log(`📡 ${name}: ${duration.toFixed(2)}ms`);
    return { result, duration };
  },

  async measureApiCall(endpoint) {
    const start = performance.now();
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      const duration = performance.now() - start;
      console.log(`📡 ${endpoint}: ${duration.toFixed(2)}ms`);
      this.metrics[`API_${endpoint}`] = duration.toFixed(2) + 'ms';
      return { data, duration };
    } catch (error) {
      const duration = performance.now() - start;
      console.log(`❌ ${endpoint}: ${duration.toFixed(2)}ms (failed)`);
      this.metrics[`API_${endpoint}_failed`] = duration.toFixed(2) + 'ms';
      return { error, duration };
    }
  },

  async testAuthPerformance() {
    console.log('🔐 Testing authentication performance...');

    const authStart = performance.now();

    // Test health check
    await this.measureApiCall('/api/health');

    // Test auth check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      await this.measureApiCall('/api/auth/validate');
    }

    const authDuration = performance.now() - authStart;
    this.metrics.authCheck = authDuration.toFixed(2) + 'ms';
    console.log(`🔐 Auth check total: ${authDuration.toFixed(2)}ms`);
  },

  async testDashboardPerformance() {
    console.log('📊 Testing dashboard performance...');

    const dashboardStart = performance.now();

    // Test batch dashboard data
    await this.measureApiCall('/api/dashboard/initial-data');

    const dashboardDuration = performance.now() - dashboardStart;
    this.metrics.dashboardLoad = dashboardDuration.toFixed(2) + 'ms';
    console.log(`📊 Dashboard load total: ${dashboardDuration.toFixed(2)}ms`);
  },

  async testBatchVsIndividual() {
    console.log('🧪 Testing batch vs individual API calls...');

    // Test individual calls
    const individualStart = performance.now();
    await Promise.all([
      this.measureApiCall('/api/tasks'),
      this.measureApiCall('/api/projects'),
      this.measureApiCall('/api/clients'),
      this.measureApiCall('/api/companies')
    ]);
    const individualTime = performance.now() - individualStart;

    // Test batch call
    const batchStart = performance.now();
    await this.measureApiCall('/api/dashboard/initial-data');
    const batchTime = performance.now() - batchStart;

    console.log(`📊 Individual calls: ${individualTime.toFixed(2)}ms`);
    console.log(`📊 Batch call: ${batchTime.toFixed(2)}ms`);

    if (individualTime > batchTime) {
      const improvement = ((individualTime - batchTime) / individualTime * 100).toFixed(1);
      console.log(`🚀 Batch is ${improvement}% faster`);
    } else {
      const difference = ((batchTime - individualTime) / individualTime * 100).toFixed(1);
      console.log(`⚠️  Individual calls are ${difference}% faster`);
    }
  },

  async testNetworkLatency() {
    console.log('🌐 Testing network latency...');

    const latencies = [];
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      await fetch('/api/health');
      const latency = performance.now() - start;
      latencies.push(latency);
      console.log(`🌐 Ping ${i + 1}: ${latency.toFixed(2)}ms`);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    this.metrics.avgLatency = avgLatency.toFixed(2) + 'ms';
    console.log(`🌐 Average latency: ${avgLatency.toFixed(2)}ms`);
  },

  async runFullTest() {
    console.log('🧪 Starting comprehensive performance test...');

    this.start();

    // Test network latency
    await this.testNetworkLatency();

    // Test auth performance
    await this.testAuthPerformance();

    // Test dashboard performance
    await this.testDashboardPerformance();

    // Test batch vs individual
    await this.testBatchVsIndividual();

    this.end();

    console.log('✅ Performance test completed!');
    console.log('💡 Tips for improvement:');
    console.log('   - Reduce API response times');
    console.log('   - Implement better caching');
    console.log('   - Use batch requests where possible');
    console.log('   - Optimize database queries');
  }
};

// Auto-start test when page loads
window.addEventListener('load', () => {
  setTimeout(() => {
    console.log('🔍 Performance test available. Run: performanceTest.runFullTest()');
    console.log('📊 Quick test: performanceTest.testBatchVsIndividual()');
  }, 2000);
});

// Make it globally available
window.performanceTest = performanceTest;
