'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

async function post(body) {
  const r = await fetch('/api/trades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({ error: 'Server error.' }));
  return { ok: r.ok, ...j };
}

export default function TradePanel() {
  const router = useRouter();
  const [mine, setMine] = useState([]);
  const [theirs, setTheirs] = useState([]);
  const [data, setData] = useState({ me: 0, trades: [] });
  const [to, setTo] = useState('');
  const [offer, setOffer] = useState([]);
  const [ask, setAsk] = useState([]);
  const [msg, setMsg] = useState('');

  async function loadMine() { const r = await fetch('/api/inventory'); if (r.ok) setMine((await r.json()).items); }
  async function loadTrades() { const r = await fetch('/api/trades'); if (r.ok) setData(await r.json()); }
  useEffect(() => { loadMine(); loadTrades(); }, []);

  async function loadTheirs() {
    setMsg(''); setAsk([]);
    const r = await fetch('/api/inventory?user=' + encodeURIComponent(to));
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setTheirs([]); return setMsg(j.error || 'User not found.'); }
    setTheirs(j.items);
  }
  const toggle = (list, setList, id) => setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const r = await post({ action: 'create', to, offerItems: offer, requestItems: ask, offerRobux: f.get('offerRobux') || 0, requestRobux: f.get('requestRobux') || 0 });
    setMsg(r.ok ? 'Trade sent.' : r.error);
    if (r.ok) { setOffer([]); setAsk([]); form.reset(); loadTrades(); }
  }
  async function respond(action, id) {
    const r = await post({ action, id });
    setMsg(r.ok ? 'Done.' : r.error);
    loadTrades(); loadMine(); router.refresh();
  }
  const list = (a, r1) => [...a, r1 ? `${r1} R$` : null].filter(Boolean).join(', ') || 'nothing';

  return (
    <>
      <form className="card" onSubmit={send}>
        <div className="row">
          <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Trade with (username)" required />
          <button type="button" className="btn" onClick={loadTheirs}>Load their items</button>
        </div>
        <div className="cols">
          <div>
            <strong>You give</strong>
            <div className="pick">
              {mine.length === 0 && <span className="muted">You own no items.</span>}
              {mine.map((i) => (<label key={i.id}><input type="checkbox" checked={offer.includes(i.id)} onChange={() => toggle(offer, setOffer, i.id)} />{i.name} #{i.id}</label>))}
            </div>
            <input name="offerRobux" placeholder="Robux to give" inputMode="numeric" />
          </div>
          <div>
            <strong>You get</strong>
            <div className="pick">
              {theirs.length === 0 && <span className="muted">Load a user to see their items.</span>}
              {theirs.map((i) => (<label key={i.id}><input type="checkbox" checked={ask.includes(i.id)} onChange={() => toggle(ask, setAsk, i.id)} />{i.name} #{i.id}</label>))}
            </div>
            <input name="requestRobux" placeholder="Robux to ask for" inputMode="numeric" />
          </div>
        </div>
        <button className="btn green big">Send trade</button>
      </form>
      {msg && <p role="status">{msg}</p>}

      <h2>Your trades</h2>
      {data.trades.length === 0 && <p className="muted">No trades yet.</p>}
      {data.trades.map((t) => {
        const incoming = t.receiver_id === data.me;
        return (
          <div className="card trade" key={t.id}>
            <p><strong>{incoming ? `From ${t.sender}` : `To ${t.receiver}`}</strong> - {t.status}</p>
            <p>{incoming ? 'They give' : 'You give'}: {list(t.offer, t.offer_robux)}</p>
            <p>{incoming ? 'You give' : 'They give'}: {list(t.request, t.request_robux)}</p>
            {t.status === 'pending' && (
              <div className="acts">
                {incoming ? (<>
                  <button className="btn green" onClick={() => respond('accept', t.id)}>Accept</button>
                  <button className="btn" onClick={() => respond('decline', t.id)}>Decline</button>
                </>) : (<button className="btn" onClick={() => respond('cancel', t.id)}>Cancel</button>)}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
