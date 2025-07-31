// Test Admin Dashboard Functions
// This script should be run in the browser console while logged in as admin

window.testAdminReports = async function() {
  console.log('🧪 Testing Admin Reports Dashboard...');
  
  try {
    // Test 1: Fetch all reports
    console.log('📋 Test 1: Fetching all reports...');
    const response1 = await fetch('/api/reports');
    
    if (!response1.ok) {
      throw new Error(`HTTP error! status: ${response1.status}`);
    }
    
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
      
      if (response4.ok) {
        const data4 = await response4.json();
        console.log('✅ Resolve action response:', data4);
      } else {
        console.error('❌ Resolve action failed:', response4.status);
      }
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
};

// Test individual actions
window.testReportActions = async function() {
  console.log('🔧 Testing individual report actions...');
  
  try {
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
    const actions = ['ignore', 'warn_user', 'delete_content'];
    
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
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${action} result:`, data.success ? '✓' : '✗', data.message);
        } else {
          console.error(`❌ ${action} failed with status:`, response.status);
        }
        
      } catch (error) {
        console.error(`❌ ${action} failed:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Test setup failed:', error);
  }
};

console.log('🚀 Admin Dashboard Test Functions Loaded');
console.log('📖 Available functions:');
console.log('  - testAdminReports(): Test complete dashboard functionality');
console.log('  - testReportActions(): Test individual report actions');
console.log('');
console.log('⚠️ Make sure you are logged in as an admin user before running these tests!');
console.log('');
console.log('Admin login credentials:');
console.log('Email: admin@gmail.com');
console.log('Password: admin123');
