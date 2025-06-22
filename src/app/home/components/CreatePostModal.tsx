import { useState } from 'react';

export default function CreatePostModal({ open = true, onClose, onPostCreated }: { open?: boolean; onClose: () => void; onPostCreated?: () => void }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedia(e.target.files[0]);
      const type = e.target.files[0].type.startsWith('video') ? 'video' : 'image';
      setMediaType(type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (media) {
        formData.append('media', media);
        formData.append('mediaType', mediaType || '');
      }
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create post');
        setLoading(false);
        return;
      }
      setContent('');
      setMedia(null);
      setMediaType(null);
      setLoading(false);
      if (onPostCreated) onPostCreated();
      onClose();
    } catch (err) {
      setError('Failed to create post');
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black bg-opacity-40" aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative pointer-events-auto">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">×</button>
          <h2 className="text-lg font-semibold mb-4 text-black">Create Post</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
              rows={3}
              placeholder="What's on your mind?"
              value={content}
              onChange={e => setContent(e.target.value)}
              required={!media}
            />
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
