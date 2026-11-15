import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(req) {
  const { username = '', password = '' } = await req.json().catch(() => ({}));
  const sql = await db();
  const [user] = await sql`SELECT id, username, password_hash FROM users WHERE lower(username) = lower(${username})`;
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return Response.json({ error: 'Wrong username or password.' }, { status: 401 });
  await createSession(user);
  return Response.json({ ok: true });
}
