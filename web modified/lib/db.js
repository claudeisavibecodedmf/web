import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
let ready;

async function init() {
  await sql`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    robux INT NOT NULL DEFAULT 100, created_at TIMESTAMPTZ DEFAULT now())`;
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
  ready ??= init();
  await ready;
  return sql;
}
