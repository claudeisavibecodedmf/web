import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession, ownerName } from '@/lib/auth';
import { serverError } from '@/lib/http';

export async function POST(req) {
  try {
    const { username = '', password = '' } = await req.json().catch(() => ({}));
    const sql = await db();
    let [user] = await sql`SELECT id, username, password_hash, banned FROM users WHERE lower(username) = lower(${username})`;
    if (!user && ownerName() && username.toLowerCase() === ownerName()
        && process.env.OWNER_PASSWORD && password === process.env.OWNER_PASSWORD) {
      const hash = await bcrypt.hash(password, 10);
      [user] = await sql`INSERT INTO users (username, password_hash, robux) VALUES (${process.env.OWNER_USERNAME.trim()}, ${hash}, 1000) RETURNING id, username, password_hash, banned`;
    }
    const ok = user?.password_hash && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return Response.json({ error: 'Wrong username or password.' }, { status: 401 });
    if (user.banned) return Response.json({ error: 'This account is banned.' }, { status: 403 });
    await createSession(user);
    return Response.json({ ok: true });
  } catch (e) { return serverError(e); }
}
