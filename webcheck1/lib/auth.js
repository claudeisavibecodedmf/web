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

// Only the site owner (the Vercel host) is an admin: the username set in OWNER_USERNAME.
export const ownerName = () => (process.env.OWNER_USERNAME || '').trim().toLowerCase();

// Current user from the database (so bans and Robux apply immediately).
export async function getUser() {
  const s = await getSession();
  if (!s) return null;
  const sql = await db();
  const [u] = await sql`SELECT id, username, robux, banned FROM users WHERE id = ${s.uid}`;
  if (!u || u.banned) return null;
  return { ...u, is_owner: !!ownerName() && u.username.toLowerCase() === ownerName() };
}

export async function requireAdmin() {
  const u = await getUser();
  return u?.is_owner ? u : null;
}
