// Simple performance test script
// Run this in the browser console to test loading times

const performanceTest = {
  startTime: null,
  endTime: null,

  start() {
    this.startTime = performance.now();
    console.log('🚀 Performance test started...');
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

    return duration;
  },

  measureApiCall(endpoint) {
    const start = performance.now();
    return fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        const duration = performance.now() - start;
        console.log(`📡 ${endpoint}: ${duration.toFixed(2)}ms`);
        return { data, duration };
      });
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
    console.log(`🚀 Improvement: ${((individualTime - batchTime) / individualTime * 100).toFixed(1)}% faster`);
  }
};

// Auto-start test when page loads
window.addEventListener('load', () => {
  setTimeout(() => {
    performanceTest.start();
    performanceTest.testBatchVsIndividual().then(() => {
      performanceTest.end();
    });
  }, 1000);
});

// Make it available globally
window.performanceTest = performanceTest;
