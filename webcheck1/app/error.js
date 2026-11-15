'use client';
export default function Error({ reset }) {
  return (
    <div className="card">
      <h1>Something went wrong</h1>
      <p>The site could not reach its database. The site owner should check that <code>DATABASE_URL</code> and <code>AUTH_SECRET</code> are set.</p>
      <button className="btn" onClick={reset}>Try again</button>
    </div>
  );
}
