const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinaryConnection() {
  console.log('🔄 Testing Cloudinary connection...');
  console.log('📋 Configuration:');
  console.log('  Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
  console.log('  API Key:', process.env.CLOUDINARY_API_KEY ? 'SET (' + process.env.CLOUDINARY_API_KEY.substring(0, 6) + '...)' : 'NOT SET');
  console.log('  API Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET (***hidden***)' : 'NOT SET');
  console.log('');

  try {
    // Test 1: Basic API connectivity
    console.log('📡 Test 1: Checking API connectivity...');
    const pingResult = await cloudinary.api.ping();
    console.log('✅ Ping successful:', pingResult);
    console.log('');

    // Test 2: Get account details
    console.log('📊 Test 2: Getting account details...');
    const usage = await cloudinary.api.usage();
    console.log('✅ Account usage info:');
    console.log('  Plan:', usage.plan || 'Unknown');
    console.log('  Credits used:', usage.credits?.used || 0);
    console.log('  Credits limit:', usage.credits?.limit || 'Unlimited');
    console.log('  Storage used:', Math.round((usage.storage?.used || 0) / 1024 / 1024 * 100) / 100, 'MB');
    console.log('  Bandwidth used:', Math.round((usage.bandwidth?.used || 0) / 1024 / 1024 * 100) / 100, 'MB');
    console.log('');

    // Test 3: List folders to check structure
    console.log('📁 Test 3: Checking folder structure...');
    try {
      const folders = await cloudinary.api.root_folders();
      console.log('✅ Root folders found:');
      folders.folders.forEach(folder => {
        console.log('  -', folder.name);
      });
      
      // Check if chill-campus folder exists
      const chillCampusFolder = folders.folders.find(f => f.name === 'chill-campus');
      if (chillCampusFolder) {
        console.log('✅ Found chill-campus folder!');
        
        // Check subfolders
        try {
          const subfolders = await cloudinary.api.sub_folders('chill-campus');
          console.log('📂 Subfolders in chill-campus:');
          subfolders.folders.forEach(folder => {
            console.log('  -', folder.name);
          });
        } catch (subErr) {
          console.log('ℹ️ No subfolders in chill-campus yet (this is normal for new setups)');
        }
      } else {
        console.log('ℹ️ chill-campus folder not found yet (will be created on first upload)');
      }
    } catch (folderErr) {
      console.log('ℹ️ Could not list folders (this is normal for new accounts)');
    }
    console.log('');

    // Test 4: Upload a small test image
    console.log('🖼️ Test 4: Testing image upload...');
    
    // Create a simple test image data (1x1 pixel PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImageBase64, {
      folder: 'chill-campus/test',
      public_id: 'connection-test-' + Date.now(),
      resource_type: 'image',
      overwrite: true
    });
    
    console.log('✅ Upload successful!');
    console.log('  URL:', uploadResult.secure_url);
    console.log('  Public ID:', uploadResult.public_id);
    console.log('  Format:', uploadResult.format);
    console.log('  Size:', uploadResult.bytes, 'bytes');
    console.log('');

    // Test 5: Clean up test image
    console.log('🧹 Test 5: Cleaning up test image...');
    const deleteResult = await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Cleanup successful:', deleteResult.result);
    console.log('');

    console.log('🎉 All Cloudinary tests passed! Your connection is working perfectly.');
    console.log('');
    console.log('📋 Summary:');
    console.log('  ✅ API connectivity: Working');
    console.log('  ✅ Authentication: Valid');
    console.log('  ✅ Upload functionality: Working');
    console.log('  ✅ Delete functionality: Working');
    console.log('  ✅ Account access: Working');
    
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:');
    console.error('');
    
    if (error.error && error.error.message) {
      console.error('Error message:', error.error.message);
    } else {
      console.error('Error:', error.message || error);
    }
    
    console.error('');
    console.log('🔍 Troubleshooting tips:');
    
    if (error.error && error.error.message.includes('Invalid API key')) {
      console.log('  - Check your CLOUDINARY_API_KEY in .env.local');
      console.log('  - Make sure there are no extra spaces or quotes');
    } else if (error.error && error.error.message.includes('Invalid signature')) {
      console.log('  - Check your CLOUDINARY_API_SECRET in .env.local');
      console.log('  - Make sure the secret is correct and has no extra characters');
    } else if (error.error && error.error.message.includes('cloud name')) {
      console.log('  - Check your CLOUDINARY_CLOUD_NAME in .env.local');
      console.log('  - Make sure it matches your Cloudinary dashboard');
    } else {
      console.log('  - Double-check all your Cloudinary credentials in .env.local');
      console.log('  - Make sure your Cloudinary account is active');
      console.log('  - Check your internet connection');
    }
    
    console.log('');
    console.log('🔗 Get your credentials from: https://console.cloudinary.com/');
  }
}

// Run the test
testCloudinaryConnection().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
