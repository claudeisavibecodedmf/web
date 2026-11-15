import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { serverError } from '@/lib/http';

export async function POST(req) {
  try {
    const { username = '', password = '' } = await req.json().catch(() => ({}));
    const sql = await db();
    const [user] = await sql`SELECT id, username, password_hash, banned FROM users WHERE lower(username) = lower(${username})`;
    const ok = user?.password_hash && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return Response.json({ error: 'Wrong username or password.' }, { status: 401 });
    if (user.banned) return Response.json({ error: 'This account is banned.' }, { status: 403 });
    await createSession(user);
    return Response.json({ ok: true });
  } catch (e) { return serverError(e); }
}
