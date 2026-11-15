'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SellControls({ id, salePrice }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  async function call(body) {
    const res = await fetch('/api/market', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...body }) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) setMsg(j.error || 'Failed.'); else { setMsg(''); router.refresh(); }
  }
  return (
    <>
      {salePrice ? (
        <><p className="muted">Listed for {salePrice.toLocaleString()} R$</p><button className="btn" onClick={() => call({ action: 'unlist' })}>Take off sale</button></>
      ) : (
        <button className="btn" onClick={() => { const p = prompt('Sell for how many R$?'); if (p) call({ action: 'list', price: p }); }}>Sell</button>
      )}
      {msg && <p className="err" role="alert">{msg}</p>}
    </>
  );
}
