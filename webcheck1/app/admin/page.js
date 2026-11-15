import { notFound } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel';
import { getUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin' };

export default async function Admin() {
  const user = await getUser().catch(() => null);
  if (!user?.is_owner) notFound();
  return (<><h1>Admin panel</h1><AdminPanel /></>);
}
