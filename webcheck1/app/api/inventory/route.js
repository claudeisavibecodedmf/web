import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { serverError } from '@/lib/http';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const me = await getUser();
    if (!me) return Response.json({ error: 'Log in first.' }, { status: 401 });
    const sql = await db();
    const name = new URL(req.url).searchParams.get('user');
    let uid = me.id;
    if (name) {
      const [u] = await sql`SELECT id FROM users WHERE lower(username) = lower(${name.trim()}) AND NOT banned`;
      if (!u) return Response.json({ error: 'User not found.' }, { status: 404 });
      uid = u.id;
    }
    const items = await sql`SELECT ui.id, i.name, i.kind, i.value, ui.sale_price, (SELECT round(avg(price))::int FROM (SELECT price FROM item_sales WHERE item_id = i.id ORDER BY id DESC LIMIT 10) s) AS rap FROM user_items ui JOIN items i ON i.id = ui.item_id WHERE ui.user_id = ${uid} ORDER BY ui.id`;
    return Response.json({ items });
  } catch (e) { return serverError(e); }
}
