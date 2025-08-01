import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Settings, { defaultSettings } from '@/models/Settings';
import User from '@/models/User';
import dbConnect from '@/lib/db';

// GET - Fetch all settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get settings document (create with defaults if none exists)
    let settingsDoc = await Settings.findOne();
    
    if (!settingsDoc) {
      // Create default settings document
      const newSettings = new Settings({
        settings: defaultSettings.map(setting => ({
          ...setting,
          updatedAt: new Date()
        }))
      });
      
      settingsDoc = await newSettings.save();
    }

    // Transform settings array into an object for easier access
    const settingsObject = settingsDoc.settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = {
        value: setting.value,
        type: setting.type,
        category: setting.category,
        description: setting.description,
        updatedAt: setting.updatedAt
      };
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      settings: settingsObject,
      version: settingsDoc.version,
      lastUpdated: settingsDoc.updatedAt
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch settings' 
    }, { status: 500 });
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { settings: updatedSettings } = await request.json();

    if (!updatedSettings || typeof updatedSettings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    // Get or create settings document
    let settingsDoc = await Settings.findOne();
    
    if (!settingsDoc) {
      settingsDoc = new Settings({
        settings: defaultSettings.map(setting => ({
          ...setting,
          updatedAt: new Date()
        }))
      });
    }

    // Update specific settings
    Object.entries(updatedSettings).forEach(([key, newValue]) => {
      const existingSettingIndex = settingsDoc!.settings.findIndex((s: any) => s.key === key);
      
      if (existingSettingIndex !== -1) {
        // Update existing setting
        settingsDoc!.settings[existingSettingIndex].value = newValue;
        settingsDoc!.settings[existingSettingIndex].updatedBy = user._id;
        settingsDoc!.settings[existingSettingIndex].updatedAt = new Date();
      } else {
        // Add new setting (in case it was added to defaults)
        const defaultSetting = defaultSettings.find(d => d.key === key);
        if (defaultSetting) {
          settingsDoc!.settings.push({
            ...defaultSetting,
            value: newValue,
            updatedBy: user._id,
            updatedAt: new Date()
          });
        }
      }
    });

    // Increment version
    settingsDoc.version += 1;
    
    await settingsDoc.save();

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      version: settingsDoc.version
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update settings' 
    }, { status: 500 });
  }
}
