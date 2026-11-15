'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaimButton() {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  async function claim() {
    const res = await fetch('/api/stipend', { method: 'POST' });
    const j = await res.json().catch(() => ({}));
    setMsg(res.ok ? 'You got 25 R$!' : j.error || 'Could not claim.');
    if (res.ok) router.refresh();
  }
  return (<><button className="btn green" onClick={claim}>Claim daily 25 R$</button>{msg && <p className="muted" role="status">{msg}</p>}</>);
}
