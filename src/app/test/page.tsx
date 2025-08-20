'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('🔄 Fetching posts from test page...');
        const res = await fetch('/api/posts');
        console.log('📡 Response status:', res.status);
        console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()));
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('📊 Posts data:', data);
        
        setPosts(data.posts || []);
      } catch (err: any) {
        console.error('❌ Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Posts API Test</h1>
      
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      <div>
        <h2>Results:</h2>
        <p>Posts count: {posts.length}</p>
        
        {posts.length > 0 && (
          <div>
            <h3>Posts:</h3>
            {posts.map((post, index) => (
              <div key={post._id || index} style={{ 
                border: '1px solid #ccc', 
                margin: '10px 0', 
                padding: '10px',
                backgroundColor: '#f9f9f9'
              }}>
                <p><strong>ID:</strong> {post._id}</p>
                <p><strong>Content:</strong> {post.content}</p>
                <p><strong>Author:</strong> {post.user?.fullName || 'Unknown'}</p>
                <p><strong>Created:</strong> {post.createdAt}</p>
                <p><strong>Disabled:</strong> {post.disabled ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
