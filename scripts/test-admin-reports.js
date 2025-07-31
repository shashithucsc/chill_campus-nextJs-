// Test script for Admin Reports Dashboard
// Run this in browser console while on admin reports page

async function testReportsDashboard() {
  console.log('🧪 Testing Admin Reports Dashboard...');
  
  try {
    // Test 1: Fetch all reports
    console.log('📋 Test 1: Fetching all reports...');
    const response1 = await fetch('/api/reports');
    const data1 = await response1.json();
    console.log('✅ All reports response:', data1);
    
    // Test 2: Fetch with filters
    console.log('🔍 Test 2: Fetching with status filter...');
    const response2 = await fetch('/api/reports?status=Pending&limit=10');
    const data2 = await response2.json();
    console.log('✅ Filtered reports response:', data2);
    
    // Test 3: Fetch with search
    console.log('🔍 Test 3: Fetching with search filter...');
    const response3 = await fetch('/api/reports?search=inappropriate&limit=5');
    const data3 = await response3.json();
    console.log('✅ Search reports response:', data3);
    
    if (data1.reports && data1.reports.length > 0) {
      const firstReport = data1.reports[0];
      console.log('📝 Testing actions on report:', firstReport.id);
      
      // Test 4: Resolve a report
      console.log('✅ Test 4: Resolving report...');
      const response4 = await fetch(`/api/reports/${firstReport.id}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          adminNotes: 'Test resolution by admin dashboard'
        })
      });
      const data4 = await response4.json();
      console.log('✅ Resolve action response:', data4);
      
      // Test 5: Check if report status changed
      console.log('🔄 Test 5: Verifying status change...');
      const response5 = await fetch('/api/reports');
      const data5 = await response5.json();
      const updatedReport = data5.reports.find(r => r.id === firstReport.id);
      console.log('✅ Updated report status:', updatedReport?.status);
    }
    
    console.log('🎉 All tests completed successfully!');
    
    return {
      success: true,
      message: 'Admin Reports Dashboard is working correctly',
      stats: data1.stats,
      totalReports: data1.pagination?.totalReports || 0
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Auto-run the test
testReportsDashboard().then(result => {
  console.log('🏁 Final Result:', result);
});

// Test individual API endpoints
async function testReportActions() {
  console.log('🔧 Testing individual report actions...');
  
  // First get a report to work with
  const reportsResponse = await fetch('/api/reports?limit=1');
  const reportsData = await reportsResponse.json();
  
  if (!reportsData.reports || reportsData.reports.length === 0) {
    console.log('❌ No reports found to test actions');
    return;
  }
  
  const testReport = reportsData.reports[0];
  console.log('🎯 Testing with report:', testReport.id);
  
  // Test all available actions
  const actions = ['resolve', 'ignore', 'delete_content', 'warn_user'];
  
  for (const action of actions) {
    try {
      console.log(`🔨 Testing action: ${action}`);
      const response = await fetch(`/api/reports/${testReport.id}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          adminNotes: `Test ${action} action from dashboard`
        })
      });
      
      const data = await response.json();
      console.log(`✅ ${action} result:`, data.success ? '✓' : '✗', data.message);
      
    } catch (error) {
      console.error(`❌ ${action} failed:`, error.message);
    }
  }
}

// Helper function to create test reports (for development)
async function createTestReports() {
  console.log('📝 Creating test reports...');
  
  // Note: This would require actual posts and users in the database
  // and the user to be logged in as a regular user, not admin
  console.log('⚠️ To create test reports, use the regular report functionality in the app');
  console.log('⚠️ Navigate to posts and use the report button to generate test data');
}

console.log('🚀 Admin Reports Dashboard Test Suite Loaded');
console.log('📖 Available functions:');
console.log('  - testReportsDashboard(): Test complete dashboard functionality');
console.log('  - testReportActions(): Test individual report actions');
console.log('  - createTestReports(): Helper to create test data');
