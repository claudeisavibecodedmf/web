import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { serverError } from '@/lib/http';

export async function POST(req) {
  try {
    const { username = '', password = '' } = await req.json().catch(() => ({}));
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username))
      return Response.json({ error: 'Username must be 3-20 letters, numbers or underscores.' }, { status: 400 });
    if (password.length < 8)
      return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    const sql = await db();
    const hash = await bcrypt.hash(password, 10);
    let user;
    try {
      [user] = await sql`INSERT INTO users (username, password_hash) VALUES (${username}, ${hash}) RETURNING id, username`;
    } catch (e) {
      if (e.code === '23505') return Response.json({ error: 'That username is taken.' }, { status: 409 });
      throw e;
    }
    const wanted = (process.env.ADMIN_USERNAME || '').toLowerCase();
    if (wanted && wanted === username.toLowerCase())
      await sql`UPDATE users SET is_admin = true WHERE id = ${user.id}`;
    else
      await sql`UPDATE users SET is_admin = true WHERE id = ${user.id} AND NOT EXISTS (SELECT 1 FROM users WHERE is_admin)`;
    await createSession(user);
    return Response.json({ ok: true });
  } catch (e) { return serverError(e); }
}
