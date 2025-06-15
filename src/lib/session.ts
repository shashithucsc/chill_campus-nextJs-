import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function createSession(user: any) {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(JWT_SECRET));

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(
      session.value,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
} 