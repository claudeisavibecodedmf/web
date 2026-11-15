import { db, tx } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { serverError, UserError } from '@/lib/http';

export async function POST(req) {
  try {
    const me = await getUser();
    if (!me) return Response.json({ error: 'Log in first.' }, { status: 401 });
    const b = await req.json().catch(() => ({}));

    if (b.action === 'list' || b.action === 'unlist') {
      const price = b.action === 'list' ? Math.floor(Number(b.price)) : null;
      if (b.action === 'list' && !(price >= 1 && price <= 1000000)) throw new UserError('Price must be between 1 and 1,000,000 R$.');
      const sql = await db();
      const rows = await sql`UPDATE user_items SET sale_price = ${price} WHERE id = ${Number(b.id)} AND user_id = ${me.id} RETURNING id`;
      if (!rows.length) throw new UserError('You do not own that item.');
      return Response.json({ ok: true });
    }

    if (b.action === 'buy') {
      const paid = await tx(async (q) => {
        const [li] = await q`SELECT ui.id, ui.user_id, ui.sale_price FROM user_items ui
          WHERE ui.item_id = ${Number(b.itemId)} AND ui.sale_price IS NOT NULL AND ui.user_id <> ${me.id}
          ORDER BY ui.sale_price, ui.id LIMIT 1 FOR UPDATE OF ui`;
        if (!li) throw new UserError('No one is selling this item right now.');
        const both = [me.id, li.user_id].sort((x, y) => x - y);
        await q`SELECT id FROM users WHERE id = ANY(${both}) ORDER BY id FOR UPDATE`;
        const [buyer] = await q`SELECT robux FROM users WHERE id = ${me.id}`;
        if (buyer.robux < li.sale_price) throw new UserError('Not enough Robux.');
        await q`UPDATE user_items SET user_id = ${me.id}, sale_price = NULL WHERE id = ${li.id}`;
        await q`UPDATE users SET robux = robux - ${li.sale_price} WHERE id = ${me.id}`;
        await q`UPDATE users SET robux = robux + ${li.sale_price} WHERE id = ${li.user_id}`;
        await q`INSERT INTO item_sales (item_id, price) VALUES (${Number(b.itemId)}, ${li.sale_price})`;
        return li.sale_price;
      });
      return Response.json({ ok: true, paid });
    }
    throw new UserError('Unknown action.');
  } catch (e) { return serverError(e); }
}
