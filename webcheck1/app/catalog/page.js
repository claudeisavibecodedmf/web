import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';

export default async function Catalog() {
  const sql = await db();
  const items = await sql`SELECT * FROM items ORDER BY id`;
  return (
    <>
      <h1>Catalog</h1>
      <div className="grid">
        {items.map((i) => (
          <article className="card game" key={i.id}>
            <div className="thumb alt" aria-hidden="true">{i.kind[0]}</div>
            <h3>{i.name}</h3>
            <p className="muted">{i.kind}</p>
            <p><strong>{i.price === 0 ? 'Free' : `${i.price} R$`}</strong></p>
          </article>
        ))}
      </div>
    </>
  );
}
