import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    unique: true,
    index: true // Add index for better query performance
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot be longer than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Tech', 'Arts', 'Clubs', 'Events', 'Others']
  },
  visibility: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public'
  },
  status: {
    type: String,
    enum: ['Active', 'Disabled'],
    default: 'Active'
  },
  coverImage: {
    type: String,
    default: '',
    validate: {
      validator: function(value: string) {
        if (!value) return true; // Allow empty string
        // Allow URLs starting with http/https or /uploads/
        return /^(https?:\/\/|\/uploads\/).+/.test(value);
      },
      message: 'Invalid image URL format'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Create a text index on the name field for better search
communitySchema.index({ name: 'text' });

// Ensure indexes are created
communitySchema.pre('save', async function(next) {
  try {
    await mongoose.model('Community').init();
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.models.Community || mongoose.model('Community', communitySchema);
