import { db } from '@/lib/db';
export const dynamic = 'force-dynamic';

export default async function Games() {
  const sql = await db();
  const games = await sql`SELECT * FROM games ORDER BY plays DESC`;
  return (
    <>
      <h1>Games</h1>
      <div className="grid">
        {games.map((g) => (
          <article className="card game" key={g.id}>
            <div className="thumb" aria-hidden="true">{g.name[0]}</div>
            <h3>{g.name}</h3>
            <p>{g.description}</p>
            <p className="muted">By {g.creator} - {g.plays.toLocaleString()} plays</p>
          </article>
        ))}
      </div>
    </>
  );
}
