
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '../../../lib/db';
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
        await dbConnect();

        const email = credentials?.email;
        const password = credentials?.password;

        const allowedDomains = ['uom.lk', 'sjp.ac.lk', 'uwu.ac.lk', 'kln.ac.lk'];
        const domain = email?.split('@')[1];
        if (!allowedDomains.includes(domain!)) {
          throw new Error('Only university emails are allowed');
        }

        const user = await User.findOne({ email });
        if (!user) throw new Error('User not found');

        const isValid = await compare(password!, user.password);
        if (!isValid) throw new Error('Incorrect password');

        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user._id;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export default handler;
