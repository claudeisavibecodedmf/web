import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET() {
  const sql = await db();
  return Response.json(await sql`SELECT * FROM items ORDER BY id`);
}
