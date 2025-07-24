import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';

// Extend the user type to include role
declare module "next-auth" {
  interface User {
    role?: string;
  }
}

// Extend JWT to include role
declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('NextAuth authorize called with:', { email: credentials?.email, hasPassword: !!credentials?.password });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        console.log('Checking database for user:', credentials.email);
        await dbConnect();

        // Use case-insensitive email search for regular users
        const user = await User.findOne({ email: { $regex: new RegExp(`^${credentials.email}$`, 'i') } });
        if (!user) {
          return null;
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error('Account not activated. Please check your email for the activation link.');
        }

        // Check if user is suspended
        if (user.status === 'Suspended') {
          throw new Error('Account suspended. Please contact support for assistance.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          console.log('Password validation failed for user:', user.email);
          return null;
        }

        console.log('User authenticated successfully:', user.email);
        // Return user with consistent ID format and all needed properties
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role,
          image: user.avatar || null,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role; // Add user role to token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string | null;
        (session.user as any).role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },
};
