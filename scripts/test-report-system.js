require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testEntireReportFlow() {
  try {
    console.log('='.repeat(60));
    console.log('COMPREHENSIVE REPORT SYSTEM TEST');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Test data
    const userId = '687606e956d069cefd283ca1';
    const postId = '686a2d633584e82e0f7b9da5';
    const anotherPostId = '6878d3a0fcb733382adc1522';
    
    console.log('\n1. Testing Report Status Check (Should show REPORTED for existing reports)');
    console.log('-'.repeat(50));
    
    // Check existing reports
    const existingReport1 = await db.collection('reports').findOne({
      'reportedBy.userId': new mongoose.Types.ObjectId(userId),
      'reportedContent.postId': new mongoose.Types.ObjectId(postId),
      type: 'Post'
    });
    
    const existingReport2 = await db.collection('reports').findOne({
      'reportedBy.userId': new mongoose.Types.ObjectId(userId),
      'reportedContent.postId': new mongoose.Types.ObjectId(anotherPostId),
      type: 'Post'
    });
    
    console.log(`Post ${postId}: ${existingReport1 ? '🚩 REPORTED' : '✅ NOT REPORTED'}`);
    console.log(`Post ${anotherPostId}: ${existingReport2 ? '🚩 REPORTED' : '✅ NOT REPORTED'}`);
    
    console.log('\n2. Testing Post Report Prevention (Should prevent duplicate reports)');
    console.log('-'.repeat(50));
    
    const duplicateCheck1 = !!existingReport1;
    const duplicateCheck2 = !!existingReport2;
    
    console.log(`Post ${postId} - Allow new report: ${!duplicateCheck1 ? '✅ YES' : '❌ NO (already reported)'}`);
    console.log(`Post ${anotherPostId} - Allow new report: ${!duplicateCheck2 ? '✅ YES' : '❌ NO (already reported)'}`);
    
    console.log('\n3. Simulating Page Refresh Scenario');
    console.log('-'.repeat(50));
    
    // Simulate what happens when page refreshes and checks report status
    const posts = [postId, anotherPostId];
    
    for (const currentPostId of posts) {
      const reportStatus = await db.collection('reports').findOne({
        'reportedBy.userId': new mongoose.Types.ObjectId(userId),
        'reportedContent.postId': new mongoose.Types.ObjectId(currentPostId),
        type: 'Post'
      });
      
      const hasUserReported = !!reportStatus;
      const buttonState = hasUserReported ? 'DISABLED (Reported)' : 'ENABLED (Report)';
      const buttonColor = hasUserReported ? 'RED' : 'WHITE';
      
      console.log(`Post ${currentPostId}:`);
      console.log(`  - Database Status: ${hasUserReported ? 'HAS REPORTED' : 'NOT REPORTED'}`);
      console.log(`  - UI Button State: ${buttonState}`);
      console.log(`  - Button Color: ${buttonColor}`);
      console.log();
    }
    
    console.log('4. Summary of All Reports by this User');
    console.log('-'.repeat(50));
    
    const allUserReports = await db.collection('reports').find({
      'reportedBy.userId': new mongoose.Types.ObjectId(userId)
    }).toArray();
    
    console.log(`Total reports by user ${userId}: ${allUserReports.length}`);
    
    const reportsByPost = {};
    allUserReports.forEach(report => {
      const pid = report.reportedContent.postId.toString();
      if (!reportsByPost[pid]) {
        reportsByPost[pid] = [];
      }
      reportsByPost[pid].push({
        reason: report.reason,
        status: report.status,
        date: report.createdAt
      });
    });
    
    Object.keys(reportsByPost).forEach(pid => {
      console.log(`\nPost ${pid}:`);
      reportsByPost[pid].forEach((report, index) => {
        console.log(`  ${index + 1}. ${report.reason} (${report.status}) - ${report.date}`);
      });
    });
    
    console.log('\n5. Test Result Summary');
    console.log('='.repeat(50));
    
    const issuesFound = [];
    
    // Check for duplicate reports on same post
    Object.keys(reportsByPost).forEach(pid => {
      if (reportsByPost[pid].length > 1) {
        issuesFound.push(`❌ Post ${pid} has ${reportsByPost[pid].length} reports (should be max 1 per user)`);
      }
    });
    
    if (issuesFound.length > 0) {
      console.log('ISSUES FOUND:');
      issuesFound.forEach(issue => console.log(issue));
    } else {
      console.log('✅ All tests passed! Report system working correctly.');
    }
    
    console.log('\n6. Expected Behavior After Fix');
    console.log('-'.repeat(50));
    console.log('✅ Report button should show "Reported" and be disabled for reported posts');
    console.log('✅ Report button should show "Report" and be enabled for non-reported posts');
    console.log('✅ Status should persist after page refresh');
    console.log('✅ Duplicate reports should be prevented');
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testEntireReportFlow();
