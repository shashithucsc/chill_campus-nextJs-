// Utility function to check if maintenance mode is enabled
// This is optional and won't affect existing functionality unless explicitly used

import Settings from '@/models/Settings';
import dbConnect from '@/lib/db';

export async function isMaintenanceModeEnabled(): Promise<boolean> {
  try {
    await dbConnect();
    
    const settingsDoc = await Settings.findOne();
    if (!settingsDoc) {
      return false; // Default to not in maintenance mode
    }

    const maintenanceSetting = settingsDoc.settings.find(
      (setting: any) => setting.key === 'maintenance_mode'
    );

    return maintenanceSetting?.value === true;
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    return false; // Default to not in maintenance mode if error
  }
}

export async function getSystemSettings() {
  try {
    await dbConnect();
    
    const settingsDoc = await Settings.findOne();
    if (!settingsDoc) {
      return {};
    }

    // Transform to object for easier access
    const settings = settingsDoc.settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return settings;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return {};
  }
}
