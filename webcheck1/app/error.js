'use client';
export default function Error({ reset }) {
  return (
    <div className="card">
      <h1>Something went wrong</h1>
      <p>The site could not reach its database. Make sure <code>DATABASE_URL</code> and <code>AUTH_SECRET</code> are set, then check <a href="/api/health">/api/health</a>.</p>
      <button className="btn" onClick={reset}>Try again</button>
    </div>
  );
}
