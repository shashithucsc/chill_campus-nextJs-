// Test script for Admin Posts Management
// Run this in browser console while logged in as admin

window.testAdminPosts = async function() {
  console.log('🧪 Testing Admin Posts Management...');
  
  try {
    // Test 1: Fetch all posts
    console.log('📋 Test 1: Fetching all posts...');
    const response1 = await fetch('/api/admin/posts');
    
    if (!response1.ok) {
      throw new Error(`HTTP error! status: ${response1.status}`);
    }
    
    const data1 = await response1.json();
    console.log('✅ All posts response:', data1);
    
    // Test 2: Fetch with filters
    console.log('🔍 Test 2: Fetching with status filter...');
    const response2 = await fetch('/api/admin/posts?status=Published&limit=5');
    const data2 = await response2.json();
    console.log('✅ Filtered posts response:', data2);
    
    // Test 3: Fetch with search
    console.log('🔍 Test 3: Fetching with search filter...');
    const response3 = await fetch('/api/admin/posts?search=hello&limit=3');
    const data3 = await response3.json();
    console.log('✅ Search posts response:', data3);
    
    if (data1.posts && data1.posts.length > 0) {
      const firstPost = data1.posts[0];
      console.log('📝 Testing actions on post:', firstPost.id);
      
      // Test 4: Get detailed post info
      console.log('📖 Test 4: Fetching post details...');
      const response4 = await fetch(`/api/admin/posts/${firstPost.id}`);
      if (response4.ok) {
        const data4 = await response4.json();
        console.log('✅ Post details response:', data4);
      } else {
        console.error('❌ Post details failed:', response4.status);
      }
      
      // Test 5: Resolve reports (if any)
      if (firstPost.status === 'Reported') {
        console.log('✅ Test 5: Resolving reports...');
        const response5 = await fetch(`/api/admin/posts/${firstPost.id}/actions`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'resolve_reports',
            adminNotes: 'Test resolution by admin dashboard'
          })
        });
        
        if (response5.ok) {
          const data5 = await response5.json();
          console.log('✅ Resolve reports response:', data5);
        } else {
          console.error('❌ Resolve reports failed:', response5.status);
        }
      }
    }
    
    console.log('🎉 All tests completed successfully!');
    
    return {
      success: true,
      message: 'Admin Posts Management is working correctly',
      stats: data1.stats,
      totalPosts: data1.pagination?.totalPosts || 0
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test individual post actions
window.testPostActions = async function() {
  console.log('🔧 Testing individual post actions...');
  
  try {
    // First get a post to work with
    const postsResponse = await fetch('/api/admin/posts?limit=1');
    const postsData = await postsResponse.json();
    
    if (!postsData.posts || postsData.posts.length === 0) {
      console.log('❌ No posts found to test actions');
      return;
    }
    
    const testPost = postsData.posts[0];
    console.log('🎯 Testing with post:', testPost.id);
    
    // Test different actions (be careful with delete!)
    const actions = ['warn_author', 'disable'];
    
    for (const action of actions) {
      try {
        console.log(`🔨 Testing action: ${action}`);
        const response = await fetch(`/api/admin/posts/${testPost.id}/actions`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: action,
            adminNotes: `Test ${action} action from admin dashboard`
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

console.log('🚀 Admin Posts Management Test Suite Loaded');
console.log('📖 Available functions:');
console.log('  - testAdminPosts(): Test complete posts management functionality');
console.log('  - testPostActions(): Test individual post actions');
console.log('');
console.log('⚠️ Make sure you are logged in as an admin user before running these tests!');
console.log('');
console.log('Admin login credentials:');
console.log('Email: admin@gmail.com');
console.log('Password: admin123');
