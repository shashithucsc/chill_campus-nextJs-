// pages/auth/signin.tsx
import { getProviders, signIn } from 'next-auth/react';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={() => signIn()}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Sign in with credentials
      </button>
    </div>
  );
}
