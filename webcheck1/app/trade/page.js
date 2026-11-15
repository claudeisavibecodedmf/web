import Link from 'next/link';
import TradePanel from '@/components/TradePanel';
import { getUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export default async function Trade() {
  const user = await getUser();
  if (!user) return <div className="card"><h1>Trade</h1><p><Link href="/login">Log in</Link> to trade.</p></div>;
  return (<><h1>Trade</h1><TradePanel /></>);
}
