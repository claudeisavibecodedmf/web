import Link from 'next/link';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();
  const sql = await db();
  const games = await sql`SELECT * FROM games ORDER BY plays DESC LIMIT 6`;
  return (
    <>
      <section className="hero card">
        <h1>{session ? `Welcome back, ${session.name}` : 'Build it. Play it. Share it.'}</h1>
        {!session && (
          <p>Make an account to join games and collect items.{' '}
            <Link href="/register" className="btn green">Sign up</Link></p>
        )}
      </section>
      <h2>Popular games</h2>
      <div className="grid">
        {games.map((g) => (
          <article className="card game" key={g.id}>
            <div className="thumb" aria-hidden="true">{g.name[0]}</div>
            <h3>{g.name}</h3>
            <p className="muted">By {g.creator}</p>
            <p className="muted">{g.plays.toLocaleString()} plays</p>
          </article>
        ))}
      </div>
    </>
  );
}
