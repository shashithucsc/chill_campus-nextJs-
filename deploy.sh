#!/bin/bash

# Deployment script for Vercel
echo "🚀 Starting deployment to Vercel..."

# Build the project first
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    git add .
    git commit -m "Fix posts and notifications API - Add proper error handling and environment variables"
    git push
    
    echo "✅ Code pushed to repository. Vercel will automatically deploy."
    echo ""
    echo "🔍 Next Steps:"
    echo "1. Wait for Vercel deployment to complete"
    echo "2. Test the debug endpoint: https://chill-campus-2025.vercel.app/api/debug"
    echo "3. Try creating a post with image"
    echo "4. Check Vercel function logs for detailed error information"
    echo ""
    echo "🔧 If issues persist, check:"
    echo "- Environment variables in Vercel dashboard"
    echo "- Database connection"
    echo "- Cloudinary configuration"
    
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi
