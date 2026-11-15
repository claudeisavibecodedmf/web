import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { serverError } from '@/lib/http';

export const dynamic = 'force-dynamic';
const deny = () => Response.json({ error: 'Admins only.' }, { status: 403 });
const bad = (error) => Response.json({ error }, { status: 400 });

export async function GET() {
  try {
    const me = await requireAdmin();
    if (!me) return deny();
    const sql = await db();
    return Response.json({
      me: me.id,
      users: await sql`SELECT id, username, robux, banned, (password_hash IS NULL) AS no_password FROM users ORDER BY id`,
      games: await sql`SELECT * FROM games ORDER BY id`,
      items: await sql`SELECT * FROM items ORDER BY id`,
    });
  } catch (e) { return serverError(e); }
}

export async function POST(req) {
  try {
    const me = await requireAdmin();
    if (!me) return deny();
    const b = await req.json().catch(() => ({}));
    const sql = await db();
    const id = Number(b.id);
    const isSelf = id === me.id;
    const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
    const int = (v) => Math.max(0, Math.min(1e9, Math.floor(Number(v))));

    try {
      switch (b.action) {
        case 'createUser': {
          const username = str(b.username, 20);
          if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) return bad('Username must be 3-20 letters, numbers or underscores.');
          if (b.password && String(b.password).length < 8) return bad('Password must be at least 8 characters.');
          const hash = b.password ? await bcrypt.hash(String(b.password), 10) : null;
          if (b.id) {
            if (!Number.isInteger(id) || id < 1) return bad('ID must be a positive whole number.');
            await sql`INSERT INTO users (id, username, password_hash) VALUES (${id}, ${username}, ${hash})`;
          } else {
            await sql`INSERT INTO users (username, password_hash) VALUES (${username}, ${hash})`;
          }
          break;
        }
        case 'setBanned':
          if (isSelf) return bad('You cannot ban yourself.');
          await sql`UPDATE users SET banned = ${!!b.banned} WHERE id = ${id}`; break;
        case 'giveItem': {
          const itemId = Number(b.itemId);
          const [it] = await sql`SELECT id FROM items WHERE id = ${itemId}`;
          if (!it) return bad('No item with that ID.');
          await sql`INSERT INTO user_items (user_id, item_id) VALUES (${id}, ${itemId})`; break;
        }
        case 'setRobux': {
          if (Number.isNaN(Number(b.robux))) return bad('Robux must be a number.');
          await sql`UPDATE users SET robux = ${int(b.robux)} WHERE id = ${id}`; break;
        }
        case 'nullifyPassword':
          await sql`UPDATE users SET password_hash = NULL WHERE id = ${id}`; break;
        case 'setPassword': {
          if (String(b.password || '').length < 8) return bad('Password must be at least 8 characters.');
          await sql`UPDATE users SET password_hash = ${await bcrypt.hash(String(b.password), 10)} WHERE id = ${id}`; break;
        }
        case 'deleteUser':
          if (isSelf) return bad('You cannot delete yourself.');
          await sql`DELETE FROM users WHERE id = ${id}`; break;
        case 'addGame':
          if (!str(b.name)) return bad('Game name is required.');
          await sql`INSERT INTO games (name, creator, description) VALUES (${str(b.name)}, ${str(b.creator) || me.username}, ${str(b.description, 500)})`; break;
        case 'deleteGame': await sql`DELETE FROM games WHERE id = ${id}`; break;
        case 'addItem':
          if (!str(b.name) || !str(b.kind, 30)) return bad('Item name and type are required.');
          await sql`INSERT INTO items (name, kind, price) VALUES (${str(b.name)}, ${str(b.kind, 30)}, ${int(b.price || 0)})`; break;
        case 'setValue': {
          const v = b.value === '' || b.value == null ? null : int(b.value);
          if (v !== null && Number.isNaN(Number(b.value))) return bad('Value must be a number.');
          await sql`UPDATE items SET value = ${v} WHERE id = ${id}`; break;
        }
        case 'deleteItem': await sql`DELETE FROM items WHERE id = ${id}`; break;
        default: return bad('Unknown action.');
      }
    } catch (e) {
      if (e.code === '23505') return bad('That username or ID already exists.');
      if (e.code === '23503') return bad('User or item not found.');
      throw e;
    }
    return Response.json({ ok: true });
  } catch (e) { return serverError(e); }
}
