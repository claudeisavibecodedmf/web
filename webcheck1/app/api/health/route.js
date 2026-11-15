import { health } from '@/lib/db';
export const dynamic = 'force-dynamic';

// Closed to everyone on the live site. Only works with `npm run dev` on your own machine.
export async function GET() {
  if (process.env.NODE_ENV === 'production')
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  const h = await health();
  return Response.json({ ...h, authSecret: !!process.env.AUTH_SECRET }, { status: h.ok ? 200 : 500 });
}
