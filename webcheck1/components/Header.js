import Link from 'next/link';
import { getUser } from '@/lib/auth';

export default async function Header() {
  let user = null;
  try { user = await getUser(); } catch {}
  return (
    <header className="nav">
      <div className="wrap navin">
        <Link href="/" className="logo">{process.env.NEXT_PUBLIC_SITE_NAME || 'BubbaBlox'}</Link>
        <nav>
          <Link href="/games">Games</Link>
          <Link href="/catalog">Catalog</Link>
          {user?.is_admin && <Link href="/admin">Admin</Link>}
        </nav>
        <div className="right">
          {user ? (
            <form action="/api/auth/logout" method="post">
              <span className="who">{user.username}</span>
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
