'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyListing({ itemId, price }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  async function buy() {
    const res = await fetch('/api/market', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'buy', itemId }) });
    const j = await res.json().catch(() => ({}));
    setMsg(res.ok ? 'Bought!' : j.error || 'Could not buy.');
    router.refresh();
  }
  return (<><button className="btn green" onClick={buy}>Buy {price.toLocaleString()} R$</button>{msg && <span className="muted" role="status"> {msg}</span>}</>);
}
