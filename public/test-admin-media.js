// Test script for creating posts with media
// Run this in browser console while logged in

window.testPostsWithMedia = async function() {
  console.log('🧪 Testing Posts with Media...');
  
  try {
    // Test data with various media types
    const testPosts = [
      {
        content: "Check out this amazing sunset photo! 🌅",
        media: ["/uploads/1753345763457-ijcb.jpeg"],
        mediaType: "image"
      },
      {
        content: "Fun video from our campus event! 🎉",
        media: ["/uploads/1750578584483-g2k84x.mp4"],
        mediaType: "video"
      },
      {
        content: "Multiple photos from today's activities! 📸",
        media: [
          "/uploads/1753345763457-ijcb.jpeg",
          "/uploads/1753346747467-jhdj.jpeg",
          "/uploads/1753364188670-7odh.jpeg"
        ],
        mediaType: "image"
      }
    ];
    
    // First, let's check what posts exist
    console.log('📋 Checking existing posts...');
    const response = await fetch('/api/admin/posts?limit=5');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Current posts:', data);
    
    // Check for posts with media
    const postsWithMedia = data.posts.filter(post => post.hasMedia);
    console.log(`📸 Found ${postsWithMedia.length} posts with media:`);
    
    postsWithMedia.forEach((post, index) => {
      console.log(`  ${index + 1}. Post by ${post.authorName}:`);
      console.log(`     - Content: ${post.content.substring(0, 50)}...`);
      console.log(`     - Media: ${post.media?.length || 0} items`);
      console.log(`     - Type: ${post.mediaType}`);
      console.log(`     - First media URL: ${post.mediaUrl}`);
    });
    
    if (postsWithMedia.length === 0) {
      console.log('⚠️ No posts with media found in current data');
      console.log('💡 You can create posts with media using the regular post creation interface');
    } else {
      console.log('🎉 Media posts found! You can test the media viewer in the admin dashboard');
    }
    
    // Test individual post details
    if (postsWithMedia.length > 0) {
      const firstMediaPost = postsWithMedia[0];
      console.log(`🔍 Testing detailed view of post: ${firstMediaPost.id}`);
      
      const detailResponse = await fetch(`/api/admin/posts/${firstMediaPost.id}`);
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        console.log('✅ Post details with media:', detailData);
      }
    }
    
    return {
      success: true,
      message: 'Media posts test completed',
      postsWithMedia: postsWithMedia.length,
      totalPosts: data.pagination?.totalPosts || 0
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to check media URLs
window.checkMediaUrls = async function() {
  console.log('🔗 Checking media URL accessibility...');
  
  const testUrls = [
    '/uploads/1753345763457-ijcb.jpeg',
    '/uploads/1753346747467-jhdj.jpeg',
    '/uploads/1750578584483-g2k84x.mp4'
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`${response.ok ? '✅' : '❌'} ${url} - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`);
    }
  }
};

console.log('🚀 Admin Posts Media Test Suite Loaded');
console.log('📖 Available functions:');
console.log('  - testPostsWithMedia(): Check existing posts with media');
console.log('  - checkMediaUrls(): Test media URL accessibility');
console.log('');
console.log('📸 The admin dashboard now supports:');
console.log('  - Click on post media to open full-screen viewer');
console.log('  - Navigate between multiple media items with arrows');
console.log('  - Keyboard navigation (←/→ arrows, Escape to close)');
console.log('  - Media type indicators (photo/video icons)');
console.log('  - Media count badges for posts with multiple items');
