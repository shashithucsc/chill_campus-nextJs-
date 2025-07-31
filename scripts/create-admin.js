const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// User schema (simplified version for this script)
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'community_admin', 'community_moderator', 'admin'],
    default: 'student' 
  },
  isActive: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['Active', 'Suspended'],
    default: 'Active' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb+srv://chillcampus:1234@chillcampuscluster.xryax7f.mongodb.net/chillCampus?retryWrites=true&w=majority&appName=chillCampusCluster';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      
      // Update existing admin's password and role
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.findByIdAndUpdate(existingAdmin._id, {
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        status: 'Active',
        updatedAt: new Date()
      });
      
      console.log('Admin user updated successfully');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        fullName: 'System Administrator',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        status: 'Active'
      });

      await adminUser.save();
      console.log('Admin user created successfully');
    }

    console.log('Admin credentials:');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();
