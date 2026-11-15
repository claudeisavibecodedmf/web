import Link from 'next/link';
import { getSession } from '@/lib/auth';

export default async function Header() {
  const session = await getSession();
  return (
    <header className="nav">
      <div className="wrap navin">
        <Link href="/" className="logo">{process.env.NEXT_PUBLIC_SITE_NAME || 'BubbaBlox'}</Link>
        <nav>
          <Link href="/games">Games</Link>
          <Link href="/catalog">Catalog</Link>
        </nav>
        <div className="right">
          {session ? (
            <form action="/api/auth/logout" method="post">
              <span className="who">{session.name}</span>
              <button className="btn ghost">Log out</button>
            </form>
          ) : (
            <>
              <Link href="/login" className="btn ghost">Log in</Link>
              <Link href="/register" className="btn green">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
