'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const f = new FormData(e.currentTarget);
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: f.get('username'), password: f.get('password') }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    router.push('/'); router.refresh();
  }

  return (
    <form className="card auth" onSubmit={submit}>
      <h1>{isLogin ? 'Log in' : 'Create your account'}</h1>
      <label>Username<input name="username" autoComplete="username" required /></label>
      <label>Password<input name="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} required /></label>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn green big" disabled={busy}>{isLogin ? 'Log in' : 'Sign up'}</button>
    </form>
  );
}
