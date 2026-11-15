import { db, tx } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { serverError, UserError } from '@/lib/http';
export const dynamic = 'force-dynamic';

const ids = (v) => [...new Set((Array.isArray(v) ? v : []).map(Number).filter(Number.isInteger))].slice(0, 10);
const money = (v) => Math.max(0, Math.min(1e9, Math.floor(Number(v) || 0)));
const noAuth = () => Response.json({ error: 'Log in first.' }, { status: 401 });

export async function GET() {
  try {
    const me = await getUser();
    if (!me) return noAuth();
    const sql = await db();
    const rows = await sql`SELECT t.id, t.sender_id, t.receiver_id, t.offer_items, t.request_items,
        t.offer_robux, t.request_robux, t.status, s.username AS sender, r.username AS receiver
      FROM trades t JOIN users s ON s.id = t.sender_id JOIN users r ON r.id = t.receiver_id
      WHERE t.sender_id = ${me.id} OR t.receiver_id = ${me.id} ORDER BY t.id DESC LIMIT 50`;
    const all = [...new Set(rows.flatMap((t) => [...t.offer_items, ...t.request_items]))];
    const names = all.length
      ? await sql`SELECT ui.id, i.name FROM user_items ui JOIN items i ON i.id = ui.item_id WHERE ui.id = ANY(${all})`
      : [];
    const nm = Object.fromEntries(names.map((n) => [n.id, n.name]));
    const label = (list) => list.map((i) => nm[i] || '(removed item)');
    return Response.json({
      me: me.id,
      trades: rows.map((t) => ({ ...t, offer: label(t.offer_items), request: label(t.request_items) })),
    });
  } catch (e) { return serverError(e); }
}

export async function POST(req) {
  try {
    const me = await getUser();
    if (!me) return noAuth();
    const b = await req.json().catch(() => ({}));
    const sql = await db();

    if (b.action === 'create') {
      const [target] = await sql`SELECT id FROM users WHERE lower(username) = lower(${String(b.to || '').trim()}) AND NOT banned`;
      if (!target) throw new UserError('User not found.');
      if (target.id === me.id) throw new UserError('You cannot trade with yourself.');
      const offer = ids(b.offerItems), ask = ids(b.requestItems);
      const offerRobux = money(b.offerRobux), askRobux = money(b.requestRobux);
      if (!offer.length && !ask.length && !offerRobux && !askRobux) throw new UserError('Add something to the trade.');
      if (offerRobux > me.robux) throw new UserError('You do not have that much Robux.');
      const mine = offer.length ? await sql`SELECT id FROM user_items WHERE user_id = ${me.id} AND id = ANY(${offer})` : [];
      const theirs = ask.length ? await sql`SELECT id FROM user_items WHERE user_id = ${target.id} AND id = ANY(${ask})` : [];
      if (mine.length !== offer.length) throw new UserError('You can only offer items you own.');
      if (theirs.length !== ask.length) throw new UserError('They no longer own some of the items you asked for.');
      const [{ n }] = await sql`SELECT count(*)::int AS n FROM trades WHERE sender_id = ${me.id} AND status = 'pending'`;
      if (n >= 20) throw new UserError('You have too many pending trades. Cancel some first.');
      await sql`INSERT INTO trades (sender_id, receiver_id, offer_items, request_items, offer_robux, request_robux)
        VALUES (${me.id}, ${target.id}, ${offer}, ${ask}, ${offerRobux}, ${askRobux})`;
      return Response.json({ ok: true });
    }

    const id = Number(b.id);
    if (b.action === 'decline' || b.action === 'cancel') {
      const col = b.action === 'decline' ? 'receiver_id' : 'sender_id';
      const status = b.action === 'decline' ? 'declined' : 'cancelled';
      const rows = col === 'receiver_id'
        ? await sql`UPDATE trades SET status = ${status} WHERE id = ${id} AND receiver_id = ${me.id} AND status = 'pending' RETURNING id`
        : await sql`UPDATE trades SET status = ${status} WHERE id = ${id} AND sender_id = ${me.id} AND status = 'pending' RETURNING id`;
      if (!rows.length) throw new UserError('Trade is no longer available.');
      return Response.json({ ok: true });
    }

    if (b.action === 'accept') {
      await tx(async (q) => {
        const [t] = await q`SELECT * FROM trades WHERE id = ${id} FOR UPDATE`;
        if (!t || t.status !== 'pending' || t.receiver_id !== me.id) throw new UserError('Trade is no longer available.');
        const both = [t.sender_id, t.receiver_id].sort((x, y) => x - y);
        await q`SELECT id FROM users WHERE id = ANY(${both}) ORDER BY id FOR UPDATE`;
        const us = await q`SELECT id, robux, banned FROM users WHERE id = ANY(${both})`;
        const S = us.find((u) => u.id === t.sender_id), R = us.find((u) => u.id === t.receiver_id);
        if (!S || !R || S.banned || R.banned) throw new UserError('This trade cannot be completed.');
        if (S.robux < t.offer_robux || R.robux < t.request_robux) throw new UserError('Not enough Robux to complete this trade.');
        const a = await q`SELECT id FROM user_items WHERE user_id = ${t.sender_id} AND id = ANY(${t.offer_items}) FOR UPDATE`;
        const c = await q`SELECT id FROM user_items WHERE user_id = ${t.receiver_id} AND id = ANY(${t.request_items}) FOR UPDATE`;
        if (a.length !== t.offer_items.length || c.length !== t.request_items.length)
          throw new UserError('Some items in this trade are no longer owned by the original owner.');
        await q`UPDATE user_items SET user_id = ${t.receiver_id} WHERE id = ANY(${t.offer_items})`;
        await q`UPDATE user_items SET user_id = ${t.sender_id} WHERE id = ANY(${t.request_items})`;
        await q`UPDATE users SET robux = robux - ${t.offer_robux} + ${t.request_robux} WHERE id = ${t.sender_id}`;
        await q`UPDATE users SET robux = robux + ${t.offer_robux} - ${t.request_robux} WHERE id = ${t.receiver_id}`;
        await q`UPDATE trades SET status = 'accepted' WHERE id = ${t.id}`;
      });
      return Response.json({ ok: true });
    }
    throw new UserError('Unknown action.');
  } catch (e) { return serverError(e); }
}
