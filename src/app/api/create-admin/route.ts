import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { secretKey } = await req.json();
    
    // Simple protection - only allow if secret key matches
    if (secretKey !== 'create-admin-secret-2025') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      // Update existing user to admin
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        status: 'Active',
        updatedAt: new Date()
      });
      
      return NextResponse.json({ 
        message: 'Admin user updated successfully',
        admin: {
          email: 'admin@gmail.com',
          role: 'admin',
          fullName: existingAdmin.fullName
        }
      });
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        fullName: 'System Administrator',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        university: 'System Administration',
        isActive: true,
        status: 'Active',
        activationToken: 'activated' // Since admin is pre-activated
      });

      await adminUser.save();
      
      return NextResponse.json({ 
        message: 'Admin user created successfully',
        admin: {
          email: 'admin@gmail.com',
          role: 'admin',
          fullName: 'System Administrator'
        }
      });
    }
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
