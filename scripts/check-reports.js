require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkReports() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');
    
    const db = mongoose.connection.db;
    
    console.log('Checking reports collection...');
    const reports = await db.collection('reports').find({}).toArray();
    
    console.log(`Total reports: ${reports.length}`);
    console.log('='.repeat(50));
    
    if (reports.length > 0) {
      reports.forEach((report, index) => {
        console.log(`${index + 1}. Report ID: ${report._id}`);
        console.log(`   Type: ${report.type}`);
        console.log(`   Status: ${report.status}`);
        console.log(`   Reason: ${report.reason}`);
        console.log(`   Reported By User ID: ${report.reportedBy?.userId}`);
        console.log(`   Reported By Name: ${report.reportedBy?.name}`);
        console.log(`   Reported Post ID: ${report.reportedContent?.postId}`);
        console.log(`   Reported Author ID: ${report.reportedContent?.authorId}`);
        console.log(`   Content Preview: ${report.reportedContent?.content?.substring(0, 50)}...`);
        console.log(`   Created At: ${report.createdAt}`);
        console.log();
      });
    } else {
      console.log('No reports found in the database');
    }
    
    // Also check for reports by a specific user
    const testUserId = '687606e956d069cefd283ca1';
    console.log(`Checking reports by user ${testUserId}...`);
    
    const userReports = await db.collection('reports').find({
      'reportedBy.userId': new mongoose.Types.ObjectId(testUserId)
    }).toArray();
    
    console.log(`Reports by this user: ${userReports.length}`);
    
    if (userReports.length > 0) {
      userReports.forEach((report, index) => {
        console.log(`  ${index + 1}. Post: ${report.reportedContent?.postId} - Status: ${report.status}`);
      });
    }
    
    mongoose.disconnect();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkReports();
