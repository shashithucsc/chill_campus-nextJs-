'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PostRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  useEffect(() => {
    if (id) {
      // Redirect to the correct post page
      router.replace(`/post/${id}`);
    }
  }, [id, router]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecting to post...</p>
      </motion.div>
    </div>
  );
}
