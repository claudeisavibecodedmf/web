import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import BuyListing from '@/components/BuyListing';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Values' };

const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString());

export default async function Values() {
  const sql = await db();
  const user = await getUser().catch(() => null);
  const rows = await sql`SELECT i.id, i.name, i.kind, i.price, i.value,
      (SELECT round(avg(price))::int FROM (SELECT price FROM item_sales WHERE item_id = i.id ORDER BY id DESC LIMIT 10) s) AS rap,
      (SELECT count(*)::int FROM item_sales WHERE item_id = i.id) AS sales,
      (SELECT count(*)::int FROM user_items WHERE item_id = i.id) AS owners,
      (SELECT min(sale_price) FROM user_items WHERE item_id = i.id AND sale_price IS NOT NULL) AS lowest
    FROM items i ORDER BY coalesce(i.value, 0) DESC, i.id`;
  return (
    <>
      <h1>RAP and values</h1>
      <p className="muted">RAP is the average of an item&rsquo;s last 10 resale prices. Value is the site owner&rsquo;s estimate of what it is worth in trades. Sell items from your inventory to set the market price.</p>
      <div className="scroll card">
        <table>
          <thead><tr><th>Item</th><th>Type</th><th>Value</th><th>RAP</th><th>RAP vs value</th><th>Sales</th><th>Owners</th><th>Cheapest resale</th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const diff = r.rap != null && r.value > 0 ? Math.round(((r.rap - r.value) / r.value) * 100) : null;
              return (
                <tr key={r.id}>
                  <td>{r.name}</td><td>{r.kind}</td>
                  <td>{fmt(r.value)}</td><td>{fmt(r.rap)}</td>
                  <td>{diff == null ? '-' : `${diff > 0 ? '+' : ''}${diff}%`}</td>
                  <td>{r.sales}</td><td>{r.owners}</td>
                  <td>{r.lowest == null ? '-' : user ? <BuyListing itemId={r.id} price={r.lowest} /> : `${fmt(r.lowest)} R$`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
