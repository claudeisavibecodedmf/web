import pg from 'pg';

const g = globalThis;
const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL;

function pool() {
  if (!g.__bbPool) {
    if (!url()) throw new Error('DATABASE_URL is not set');
    g.__bbPool = new pg.Pool({ connectionString: url(), max: process.env.VERCEL ? 1 : 10 });
  }
  return g.__bbPool;
}

// Tagged template: sql`SELECT * FROM users WHERE id = ${id}` -> rows[]
function sql(strings, ...values) {
  const text = strings.reduce((acc, s, i) => acc + '$' + i + s);
  return pool().query(text, values).then((r) => r.rows);
}

async function init() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT,
    robux INT NOT NULL DEFAULT 100, created_at TIMESTAMPTZ DEFAULT now())`;
  await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN NOT NULL DEFAULT false`;
  await sql`CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, creator TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '', plays INT NOT NULL DEFAULT 0)`;
  await sql`CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, price INT NOT NULL DEFAULT 0)`;
  const [{ n }] = await sql`SELECT count(*)::int AS n FROM games`;
  if (n === 0) {
    await sql`INSERT INTO games (name, creator, description, plays) VALUES
      ('Crossroads', 'BubbaBlox', 'The classic free-for-all map.', 1204),
      ('Happy Home', 'BubbaBlox', 'Build a house and invite friends.', 873),
      ('Obby Classic', 'BubbaBlox', 'Jump your way to the top.', 655)`;
    await sql`INSERT INTO items (name, kind, price) VALUES
      ('Classic Fedora', 'Hat', 50), ('Blue Cap', 'Hat', 25), ('Red Shirt', 'Shirt', 15),
      ('Cargo Pants', 'Pants', 15), ('Smiley Face', 'Face', 0)`;
  }
}

export async function db() {
  g.__bbReady ??= init().catch((e) => { g.__bbReady = null; throw e; });
  await g.__bbReady;
  return sql;
}

export async function health() {
  if (!url()) return { ok: false, configured: false, code: 'DATABASE_URL missing' };
  try { await db(); return { ok: true, configured: true }; }
  catch (e) { return { ok: false, configured: true, code: String(e.code || 'unknown') }; }
}
