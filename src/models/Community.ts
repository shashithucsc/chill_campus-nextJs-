import mongoose, { Document, Schema } from 'mongoose';

// Define interface for Community document
export interface ICommunity extends Document {
  name: string;
  description: string;
  category: 'Tech' | 'Arts' | 'Clubs' | 'Events' | 'Others';
  visibility: 'Public' | 'Private';
  status: 'Active' | 'Disabled';
  coverImage?: string;
  tags?: string[];
  createdBy: mongoose.Types.ObjectId;
  members?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Explicit model name constant
export const COMMUNITY_MODEL_NAME = 'Community';

const communitySchema = new Schema<ICommunity>({
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
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Create a text index on the name field for better search
communitySchema.index({ name: 'text' });

// Check if the model exists before creating it
let CommunityModel: mongoose.Model<ICommunity>;

try {
  // Try to get the existing model
  CommunityModel = mongoose.model<ICommunity>(COMMUNITY_MODEL_NAME);
  console.log('Community model already exists');
} catch (error) {
  // Model doesn't exist, create it
  CommunityModel = mongoose.model<ICommunity>(COMMUNITY_MODEL_NAME, communitySchema);
  console.log('Community model created');
}

// Export the model
export default CommunityModel;
