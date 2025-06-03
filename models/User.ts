// models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// List of Sri Lankan university email domains
const UNIVERSITY_EMAIL_DOMAINS = [
  'sci.sjp.ac.lk',    // Sri Jayewardenepura
  'cse.mrt.ac.lk',    // Moratuwa
  'eng.pdn.ac.lk',    // Peradeniya
  'ucsc.cmb.ac.lk',   // Colombo
  'kln.ac.lk',        // Kelaniya
  'sab.ac.lk',        // Sabaragamuwa
  'rjt.ac.lk',        // Rajarata
  'esn.ac.lk',        // Eastern
  'vau.ac.lk',        // Vavuniya
  'uwu.ac.lk',        // Uva Wellassa
  'wou.ac.lk',        // Wayamba
  'sliit.lk',         // SLIIT
  'nsbm.ac.lk',       // NSBM
  'iit.ac.lk',        // IIT
  'uom.lk',           // University of Moratuwa
  'cmb.ac.lk',        // University of Colombo
  'pdn.ac.lk',        // University of Peradeniya
  'uop.com',          // Added for testing
];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        const domain = email.split('@')[1];
        return UNIVERSITY_EMAIL_DOMAINS.includes(domain);
      },
      message: 'Please use a valid Sri Lankan university email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // This ensures password is not returned by default
  },
  university: {
    type: String,
    required: [true, 'University is required'],
    trim: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check if password matches
userSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Prevent mongoose from creating a new model if it already exists
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
