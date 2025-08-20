// Debug script for browser console
// Run this in the browser console to test APIs

async function debugAPIs() {
  console.log('🔍 Starting API Debug...');
  
  try {
    // Test session
    console.log('1. Testing session...');
    const sessionRes = await fetch('/api/auth/session');
    const sessionData = await sessionRes.json();
    console.log('Session:', sessionData);
    
    // Test posts API
    console.log('2. Testing posts API...');
    const postsRes = await fetch('/api/posts');
    const postsData = await postsRes.json();
    console.log('Posts response:', postsData);
    console.log(`Found ${postsData.posts?.length || 0} posts`);
    
    if (postsData.posts && postsData.posts.length > 0) {
      console.log('Post sample:', postsData.posts[0]);
    }
    
    // Test conversations API
    console.log('3. Testing conversations API...');
    const convRes = await fetch('/api/direct-messages/conversations');
    const convData = await convRes.json();
    console.log('Conversations response:', convData);
    console.log(`Found ${convData.conversations?.length || 0} conversations`);
    
    if (convData.conversations && convData.conversations.length > 0) {
      console.log('Conversation sample:', convData.conversations[0]);
    }
    
    // Test users API for search
    console.log('4. Testing users search API...');
    const usersRes = await fetch('/api/users/search?q=test&limit=5');
    const usersData = await usersRes.json();
    console.log('Users search response:', usersData);
    
    console.log('✅ API Debug completed');
    
    return {
      session: sessionData,
      posts: postsData,
      conversations: convData,
      users: usersData
    };
    
  } catch (error) {
    console.error('❌ API Debug failed:', error);
    return { error: error.message };
  }
}

// Auto-run the debug
debugAPIs();
