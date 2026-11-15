'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyButton({ id }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  async function buy() {
    setMsg('');
    const res = await fetch('/api/catalog/buy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId: id }) });
    const j = await res.json().catch(() => ({}));
    setMsg(res.ok ? 'Bought!' : j.error || 'Could not buy.');
    if (res.ok) router.refresh();
  }
  return (<><button className="btn green" onClick={buy}>Buy</button>{msg && <p className="muted" role="status">{msg}</p>}</>);
}
