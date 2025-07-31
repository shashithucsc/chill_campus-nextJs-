// Test script to check API route compilation
import { NextRequest } from 'next/server';

// Mock the required modules
const mockRequest = {
  json: () => Promise.resolve({
    postId: '684038a57adcd9b419c891b9',
    reason: 'Inappropriate Content',
    description: 'Test report description'
  })
} as NextRequest;

console.log('Testing API route imports...');

try {
  // Test if we can import the route
  import('../src/app/api/reports/route.ts').then(() => {
    console.log('✅ API route imports successfully');
  }).catch((error) => {
    console.error('❌ API route import failed:', error);
  });
} catch (error) {
  console.error('❌ Failed to test API route:', error);
}
