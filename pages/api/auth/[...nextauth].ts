import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { compare } from 'bcryptjs';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await connectDB();

          const email = credentials?.email;
          const password = credentials?.password;

          if (!email || !password) {
            throw new Error('Please provide both email and password');
          }

          const allowedDomains = ['uom.lk', 'sjp.ac.lk', 'uwu.ac.lk', 'kln.ac.lk'];
          const domain = email.split('@')[1];
          if (!allowedDomains.includes(domain)) {
            throw new Error('Only university emails are allowed');
          }

          const user = await User.findOne({ email });
          if (!user) throw new Error('User not found');

          const isValid = await compare(password, user.password);
          if (!isValid) throw new Error('Incorrect password');

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            university: user.university,
          };
        } catch (error: any) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.university = user.university;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.university = token.university;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
});

export default handler;
