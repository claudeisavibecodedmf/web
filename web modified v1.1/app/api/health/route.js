import { health } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET() {
  const h = await health();
  return Response.json({ ...h, authSecret: !!process.env.AUTH_SECRET }, { status: h.ok ? 200 : 500 });
}
