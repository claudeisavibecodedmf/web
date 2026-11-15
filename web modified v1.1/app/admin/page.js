import AdminPanel from '@/components/AdminPanel';
import { getUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin' };

export default async function Admin() {
  const user = await getUser();
  if (!user) return <div className="card"><h1>Admin</h1><p>Log in with an admin account to continue.</p></div>;
  if (!user.is_admin) return <div className="card"><h1>Admin</h1><p>This account is not an admin.</p></div>;
  return (<><h1>Admin panel</h1><AdminPanel /></>);
}
