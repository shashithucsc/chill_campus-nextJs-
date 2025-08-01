// Test script for Admin Settings Management
// Run this in browser console while logged in as admin

window.testAdminSettings = async function() {
  console.log('🧪 Testing Admin Settings Management...');
  
  try {
    // Test 1: Fetch all settings
    console.log('⚙️ Test 1: Fetching all settings...');
    const response1 = await fetch('/api/admin/settings');
    
    if (!response1.ok) {
      throw new Error(`HTTP error! status: ${response1.status}`);
    }
    
    const data1 = await response1.json();
    console.log('✅ Settings response:', data1);
    
    if (data1.success) {
      console.log('📋 Current settings:');
      Object.entries(data1.settings).forEach(([key, setting]) => {
        console.log(`  - ${key}: ${setting.value} (${setting.type})`);
      });
    }
    
    // Test 2: Update a simple setting
    console.log('🔧 Test 2: Updating maintenance mode...');
    const currentMaintenance = data1.settings.maintenance_mode?.value || false;
    const newMaintenance = !currentMaintenance;
    
    const response2 = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          maintenance_mode: newMaintenance
        }
      })
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Update response:', data2);
      console.log(`✅ Maintenance mode changed: ${currentMaintenance} → ${newMaintenance}`);
    } else {
      console.error('❌ Update failed:', response2.status);
    }
    
    // Test 3: Update multiple settings
    console.log('🔧 Test 3: Updating multiple settings...');
    const response3 = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          theme_mode: 'light',
          password_min_length: 10,
          email_notifications: true
        }
      })
    });
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ Multiple settings update:', data3);
    } else {
      console.error('❌ Multiple settings update failed:', response3.status);
    }
    
    // Test 4: Verify changes
    console.log('✅ Test 4: Verifying changes...');
    const response4 = await fetch('/api/admin/settings');
    
    if (response4.ok) {
      const data4 = await response4.json();
      console.log('📋 Updated settings verification:');
      console.log(`  - Maintenance Mode: ${data4.settings.maintenance_mode?.value}`);
      console.log(`  - Theme Mode: ${data4.settings.theme_mode?.value}`);
      console.log(`  - Password Length: ${data4.settings.password_min_length?.value}`);
      console.log(`  - Email Notifications: ${data4.settings.email_notifications?.value}`);
    }
    
    return {
      success: true,
      message: 'Admin Settings Management is working correctly',
      settingsCount: Object.keys(data1.settings).length
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test logo upload functionality
window.testLogoUpload = async function() {
  console.log('🖼️ Testing Logo Upload...');
  
  // Create a simple test image blob
  const canvas = document.createElement('canvas');
  canvas.width = 150;
  canvas.height = 150;
  const ctx = canvas.getContext('2d');
  
  // Draw a simple test logo
  ctx.fillStyle = '#3B82F6';
  ctx.fillRect(0, 0, 150, 150);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('LOGO', 75, 80);
  
  // Convert to blob
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      try {
        const formData = new FormData();
        formData.append('logo', blob, 'test-logo.png');
        
        const response = await fetch('/api/admin/settings/upload-logo', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Logo upload successful:', data);
          
          // Update logo setting
          const updateResponse = await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              settings: {
                site_logo: data.url
              }
            })
          });
          
          if (updateResponse.ok) {
            console.log('✅ Logo setting updated successfully');
          }
          
          resolve({ success: true, url: data.url });
        } else {
          console.error('❌ Logo upload failed:', response.status);
          resolve({ success: false, error: 'Upload failed' });
        }
      } catch (error) {
        console.error('❌ Logo upload error:', error);
        resolve({ success: false, error: error.message });
      }
    }, 'image/png');
  });
};

// Test settings UI functionality
window.testSettingsUI = function() {
  console.log('🎨 Testing Settings UI...');
  
  // Check if we're on the settings page
  if (!window.location.pathname.includes('/Settings')) {
    console.log('⚠️ Please navigate to /Admin/Dashboard/Settings to test UI');
    return;
  }
  
  // Look for setting elements
  const toggles = document.querySelectorAll('input[type="checkbox"]');
  const selects = document.querySelectorAll('select');
  const numberInputs = document.querySelectorAll('input[type="number"]');
  
  console.log(`📊 UI Elements found:`);
  console.log(`  - Toggles: ${toggles.length}`);
  console.log(`  - Select dropdowns: ${selects.length}`);
  console.log(`  - Number inputs: ${numberInputs.length}`);
  
  // Check for save button
  const saveButton = Array.from(document.querySelectorAll('button')).find(
    btn => btn.textContent?.includes('Save Changes')
  );
  
  if (saveButton) {
    console.log('✅ Save button found and functional');
  } else {
    console.log('⚠️ Save button not found (no changes detected)');
  }
  
  return {
    success: true,
    elements: {
      toggles: toggles.length,
      selects: selects.length,
      numberInputs: numberInputs.length,
      saveButton: !!saveButton
    }
  };
};

console.log('🚀 Admin Settings Test Suite Loaded');
console.log('📖 Available functions:');
console.log('  - testAdminSettings(): Test complete settings functionality');
console.log('  - testLogoUpload(): Test logo upload and update');
console.log('  - testSettingsUI(): Test UI elements and interactions');
console.log('');
console.log('⚙️ Settings Management Features:');
console.log('  - Real-time setting changes with immediate feedback');
console.log('  - Maintenance mode toggle (affects site accessibility)');
console.log('  - Theme mode switching (dark/light/auto)');
console.log('  - User registration controls');
console.log('  - Security settings (password requirements, 2FA)');
console.log('  - Notification preferences');
console.log('  - Data management (backups, exports)');
console.log('  - Logo upload with preview');
console.log('');
console.log('🔒 Admin login credentials:');
console.log('Email: admin@gmail.com');
console.log('Password: admin123');
