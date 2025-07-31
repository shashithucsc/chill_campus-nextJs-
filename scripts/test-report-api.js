require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testReportAPI() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    const db = mongoose.connection.db;
    
    // Test case: Check if user 687606e956d069cefd283ca1 has reported post 686a2d633584e82e0f7b9da5
    const postId = '686a2d633584e82e0f7b9da5';
    const userId = '687606e956d069cefd283ca1';
    
    console.log('Testing report status check...');
    console.log('User ID:', userId);
    console.log('Post ID:', postId);
    
    // This should work with our fix
    const existingReport = await db.collection('reports').findOne({
      'reportedBy.userId': new mongoose.Types.ObjectId(userId),
      'reportedContent.postId': new mongoose.Types.ObjectId(postId),
      type: 'Post'
    });
    
    console.log('Report found:', !!existingReport);
    
    if (existingReport) {
      console.log('Report details:');
      console.log('- Report ID:', existingReport._id);
      console.log('- Status:', existingReport.status);
      console.log('- Reason:', existingReport.reason);
      console.log('- Created:', existingReport.createdAt);
    }
    
    // Test what the API would return
    const hasUserReported = !!existingReport;
    console.log('API would return hasUserReported:', hasUserReported);
    
    await mongoose.disconnect();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testReportAPI();
