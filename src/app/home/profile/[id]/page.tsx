'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function UserProfileRedirect() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  useEffect(() => {
    // Redirect to homepage
    router.push('/home/home');
    
    // Attempt to show a toast or notification that profile viewing has changed
    try {
      // If you have a toast library already imported elsewhere
      const toastEvent = new CustomEvent('show-toast', { 
        detail: { 
          message: 'Profile viewing has been updated! Use the search feature to view user profiles.',
          type: 'info'
        } 
      });
      window.dispatchEvent(toastEvent);
    } catch (error) {
      console.log('Profile viewing has been updated. Redirecting to home page...');
    }
  }, [router, userId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Redirecting...</h2>
        <p className="text-gray-400">Profile viewing has been updated.</p>
      </div>
    </div>
  );
}
