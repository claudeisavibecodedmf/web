import { tx } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { serverError, UserError } from '@/lib/http';

export async function POST(req) {
  try {
    const me = await getUser();
    if (!me) return Response.json({ error: 'Log in to buy items.' }, { status: 401 });
    const { itemId } = await req.json().catch(() => ({}));
    await tx(async (q) => {
      const [u] = await q`SELECT robux FROM users WHERE id = ${me.id} FOR UPDATE`;
      const [item] = await q`SELECT id, price FROM items WHERE id = ${Number(itemId)}`;
      if (!item) throw new UserError('Item not found.');
      if (u.robux < item.price) throw new UserError('Not enough Robux.');
      await q`UPDATE users SET robux = robux - ${item.price} WHERE id = ${me.id}`;
      await q`INSERT INTO user_items (user_id, item_id) VALUES (${me.id}, ${item.id})`;
    });
    return Response.json({ ok: true });
  } catch (e) { return serverError(e); }
}
