#!/bin/bash

# This script sets environment variables for Vercel deployment
# Run this after deployment if environment variables are missing

echo "Setting Vercel environment variables..."

# Set production environment variables
vercel env add CLOUDINARY_CLOUD_NAME production
vercel env add CLOUDINARY_API_KEY production  
vercel env add CLOUDINARY_API_SECRET production
vercel env add MONGODB_URI production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add JWT_SECRET production
vercel env add GMAIL_USER production
vercel env add GMAIL_PASS production
vercel env add NEXT_PUBLIC_APP_URL production

echo "Environment variables set. Redeploy with: vercel --prod"