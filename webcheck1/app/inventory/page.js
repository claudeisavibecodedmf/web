import Link from 'next/link';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import ClaimButton from '@/components/ClaimButton';
import SellControls from '@/components/SellControls';
export const dynamic = 'force-dynamic';

export default async function Inventory() {
  const user = await getUser();
  if (!user) return <div className="card"><h1>Inventory</h1><p><Link href="/login">Log in</Link> to see your items.</p></div>;
  const sql = await db();
  const items = await sql`SELECT ui.id, i.name, i.kind, i.value, ui.sale_price,
      (SELECT round(avg(price))::int FROM (SELECT price FROM item_sales WHERE item_id = i.id ORDER BY id DESC LIMIT 10) s) AS rap
    FROM user_items ui JOIN items i ON i.id = ui.item_id WHERE ui.user_id = ${user.id} ORDER BY ui.id`;
  const totalRap = items.reduce((a, i) => a + (i.rap || 0), 0);
  const totalValue = items.reduce((a, i) => a + (i.value || 0), 0);
  return (
    <>
      <h1>Inventory</h1>
      <div className="card hero">
        <p>Balance: <strong>{user.robux} R$</strong> - Total RAP: <strong>{totalRap.toLocaleString()}</strong> - Total value: <strong>{totalValue.toLocaleString()}</strong></p>
        <ClaimButton />
      </div>
      {items.length === 0 ? (
        <p>You do not own anything yet. Get items from the <Link href="/catalog">catalog</Link>.</p>
      ) : (
        <div className="grid">
          {items.map((i) => (
            <article className="card game" key={i.id}>
              <div className="thumb alt" aria-hidden="true">{i.kind[0]}</div>
              <h3>{i.name}</h3>
              <p className="muted">{i.kind} - #{i.id}</p>
              <p className="muted">RAP {i.rap ?? '-'} - Value {i.value ?? '-'}</p>
              <SellControls id={i.id} salePrice={i.sale_price} />
            </article>
          ))}
        </div>
      )}
    </>
  );
}
