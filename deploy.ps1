# Deployment script for Vercel (PowerShell)
Write-Host "🚀 Starting deployment to Vercel..." -ForegroundColor Green

# Build the project first
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    # Deploy to Vercel
    Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Yellow
    git add .
    git commit -m "Fix posts and notifications API - Add proper error handling and environment variables"
    git push
    
    Write-Host "✅ Code pushed to repository. Vercel will automatically deploy." -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Wait for Vercel deployment to complete"
    Write-Host "2. Test the debug endpoint: https://chill-campus-2025.vercel.app/api/debug"
    Write-Host "3. Try creating a post with image"
    Write-Host "4. Check Vercel function logs for detailed error information"
    Write-Host ""
    Write-Host "🔧 If issues persist, check:" -ForegroundColor Yellow
    Write-Host "- Environment variables in Vercel dashboard"
    Write-Host "- Database connection"
    Write-Host "- Cloudinary configuration"
    
} else {
    Write-Host "❌ Build failed! Please fix errors before deploying." -ForegroundColor Red
    exit 1
}
