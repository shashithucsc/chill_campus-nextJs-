import mongoose, { Document, Schema, models, model } from 'mongoose';

// Interface for individual setting
export interface ISetting {
  key: string;
  value: any;
  type: 'boolean' | 'string' | 'number' | 'array' | 'object';
  category: string;
  description?: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

// Interface for the Settings document
export interface ISettings extends Document {
  settings: ISetting[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>({
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  type: { type: String, enum: ['boolean', 'string', 'number', 'array', 'object'], required: true },
  category: { type: String, required: true },
  description: { type: String },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

const SettingsSchema = new Schema<ISettings>(
  {
    settings: [SettingSchema],
    version: { type: Number, default: 1 }
  },
  { timestamps: true }
);

// Default settings that will be created if none exist
export const defaultSettings: Omit<ISetting, 'updatedAt'>[] = [
  // System Configuration
  { key: 'maintenance_mode', value: false, type: 'boolean', category: 'system', description: 'Enable maintenance mode for the site' },
  { key: 'theme_mode', value: 'dark', type: 'string', category: 'system', description: 'Default theme for the application' },
  { key: 'default_language', value: 'english', type: 'string', category: 'system', description: 'Default language for the application' },
  { key: 'site_logo', value: '/logo.png', type: 'string', category: 'system', description: 'Site logo URL' },
  
  // User Management
  { key: 'allow_registration', value: true, type: 'boolean', category: 'users', description: 'Allow new user registrations' },
  { key: 'account_verification', value: 'email_verification', type: 'string', category: 'users', description: 'Account verification method' },
  { key: 'default_user_role', value: 'student', type: 'string', category: 'users', description: 'Default role for new users' },
  
  // Security Settings
  { key: 'password_min_length', value: 8, type: 'number', category: 'security', description: 'Minimum password length' },
  { key: 'password_requirements', value: ['uppercase', 'numbers'], type: 'array', category: 'security', description: 'Password complexity requirements' },
  { key: 'require_2fa', value: false, type: 'boolean', category: 'security', description: 'Require two-factor authentication for admins' },
  { key: 'session_timeout', value: '1_hour', type: 'string', category: 'security', description: 'User session timeout duration' },
  
  // Notification Settings
  { key: 'email_notifications', value: true, type: 'boolean', category: 'notifications', description: 'Enable system email notifications' },
  { key: 'push_notifications', value: false, type: 'boolean', category: 'notifications', description: 'Enable web push notifications' },
  { key: 'notification_events', value: ['new_users', 'reports'], type: 'array', category: 'notifications', description: 'Events that trigger notifications' },
  
  // Data Management
  { key: 'auto_backup', value: false, type: 'boolean', category: 'data', description: 'Enable automatic daily backups' },
  { key: 'backup_retention', value: '30_days', type: 'string', category: 'data', description: 'Backup retention period' },
  { key: 'export_format', value: 'json', type: 'string', category: 'data', description: 'Default export format' }
];

export default models.Settings || model<ISettings>('Settings', SettingsSchema);
