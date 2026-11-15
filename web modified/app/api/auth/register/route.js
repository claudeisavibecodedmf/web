import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  const { username = '', password = '' } = await req.json().catch(() => ({}));
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username))
    return Response.json({ error: 'Username must be 3-20 letters, numbers or underscores.' }, { status: 400 });
  if (password.length < 8)
    return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  const sql = await db();
  try {
    const hash = await bcrypt.hash(password, 10);
    const [user] = await sql`INSERT INTO users (username, password_hash) VALUES (${username}, ${hash}) RETURNING id, username`;
    await createSession(user);
    return Response.json({ ok: true });
  } catch (e) {
    if (e.code === '23505') return Response.json({ error: 'That username is taken.' }, { status: 409 });
    return Response.json({ error: 'Could not create account.' }, { status: 500 });
  }
}
