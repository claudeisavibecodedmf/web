import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || '');

export async function createSession(user) {
  if (!process.env.AUTH_SECRET) throw new Error('AUTH_SECRET is not set');
  const token = await new SignJWT({ uid: user.id, name: user.username })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('30d').sign(key());
  cookies().set('session', token, {
    httpOnly: true, sameSite: 'lax', path: '/',
    secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSession() {
  const token = cookies().get('session')?.value;
  if (!token || !process.env.AUTH_SECRET) return null;
  try { return (await jwtVerify(token, key())).payload; } catch { return null; }
}

// Current user from the database (so bans and admin changes apply immediately).
export async function getUser() {
  const s = await getSession();
  if (!s) return null;
  const sql = await db();
  const [u] = await sql`SELECT id, username, robux, is_admin, banned FROM users WHERE id = ${s.uid}`;
  return u && !u.banned ? u : null;
}

export async function requireAdmin() {
  const u = await getUser();
  return u?.is_admin ? u : null;
}
