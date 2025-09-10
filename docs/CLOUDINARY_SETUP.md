# Cloudinary Migration Setup

## Overview
This project has been migrated from local file storage to Cloudinary for better deployment compatibility with Vercel and other cloud platforms.

## Cloudinary Setup

### 1. Create a Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. Note down your Cloud Name, API Key, and API Secret from the dashboard

### 2. Environment Variables
Add the following environment variables to your `.env.local` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 3. For Vercel Deployment
When deploying to Vercel, add these same environment variables in your Vercel project settings:
- Go to your Vercel project dashboard
- Navigate to Settings > Environment Variables
- Add the three Cloudinary variables

## What Was Changed

### Files Modified
1. **`src/lib/cloudinary.ts`** - New utility file for Cloudinary configuration and upload functions
2. **`src/app/api/upload/route.ts`** - Main upload endpoint migrated to Cloudinary
3. **`src/app/api/user/route.ts`** - User avatar upload migrated to Cloudinary
4. **`src/app/api/admin/settings/upload-logo/route.ts`** - Admin logo upload migrated to Cloudinary
5. **`src/app/api/posts/route.ts`** - Post media upload migrated to Cloudinary
6. **`src/app/api/posts/[id]/route.ts`** - Post edit media upload migrated to Cloudinary
7. **`src/app/api/communities/[id]/posts/route.ts`** - Community post media upload migrated to Cloudinary

### Cloudinary Folder Structure
Files are organized in Cloudinary with the following folder structure:
- `chill-campus/images/` - General images
- `chill-campus/videos/` - General videos
- `chill-campus/audio/` - Audio files
- `chill-campus/documents/` - Documents and PDFs
- `chill-campus/avatars/` - User profile pictures
- `chill-campus/logos/` - Admin uploaded logos
- `chill-campus/posts/images/` - Post images
- `chill-campus/posts/videos/` - Post videos
- `chill-campus/community-posts/images/` - Community post images
- `chill-campus/community-posts/videos/` - Community post videos

### Benefits
1. **Vercel Compatible** - No more filesystem write issues
2. **Automatic Optimization** - Cloudinary automatically optimizes images
3. **CDN Delivery** - Fast global content delivery
4. **Better Performance** - Reduced server load
5. **Scalability** - No storage limits on your server

### File Size Limits
- **General uploads**: 50MB
- **Avatar images**: 5MB
- **Admin logos**: 5MB

### Supported Formats
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, MOV, AVI
- **Audio**: MP3, WAV, OGG, M4A, AAC
- **Documents**: PDF, Word, Excel, PowerPoint, TXT, ZIP, RAR

## Testing
1. Ensure your Cloudinary credentials are correctly set in `.env.local`
2. Start your development server: `npm run dev`
3. Test uploading images/videos through:
   - Creating posts
   - Updating profile pictures
   - Creating communities with cover images
   - Admin logo uploads

## Deployment
When deploying to Vercel:
1. Make sure all Cloudinary environment variables are set in Vercel
2. The deployment will automatically use Cloudinary instead of local storage
3. All existing local URLs will need to be migrated manually if you have existing data

## Troubleshooting

### Common Issues
1. **"Upload failed" errors** - Check your Cloudinary credentials
2. **Large file failures** - Ensure files are within size limits
3. **Format not supported** - Check the allowed formats list above

### Environment Variable Issues
Make sure:
- No typos in environment variable names
- All three Cloudinary variables are set
- No extra spaces in the values
- Environment variables are properly loaded (restart your dev server)
