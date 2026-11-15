import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { serverError } from '@/lib/http';

export async function POST() {
  try {
    const me = await getUser();
    if (!me) return Response.json({ error: 'Log in first.' }, { status: 401 });
    const sql = await db();
    const rows = await sql`UPDATE users SET robux = robux + 25, last_stipend = now()
      WHERE id = ${me.id} AND (last_stipend IS NULL OR last_stipend < now() - interval '24 hours') RETURNING robux`;
    if (!rows.length) return Response.json({ error: 'You already claimed your daily Robux. Come back in 24 hours.' }, { status: 429 });
    return Response.json({ ok: true, robux: rows[0].robux });
  } catch (e) { return serverError(e); }
}
