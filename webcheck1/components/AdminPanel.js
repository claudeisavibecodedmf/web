'use client';
import { useEffect, useState } from 'react';

export default function AdminPanel() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('users');
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin');
    if (res.ok) setData(await res.json()); else setMsg('Could not load admin data.');
  }
  useEffect(() => { load(); }, []);

  async function act(action, payload = {}) {
    setMsg('');
    const res = await fetch('/api/admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) setMsg(j.error || 'Action failed.'); else { setMsg('Done.'); load(); }
  }
  const submit = (action) => (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    e.currentTarget.reset();
    act(action, f);
  };

  if (!data) return <p>{msg || 'Loading...'}</p>;

  return (
    <>
      <div className="tabs">
        {['users', 'games', 'items'].map((t) => (
          <button key={t} className={`btn ${tab === t ? 'green' : ''}`} onClick={() => setTab(t)}>
            {t === 'items' ? 'Catalog' : t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {msg && <p role="status" className="muted">{msg}</p>}

      {tab === 'users' && (
        <>
          <form className="card row" onSubmit={submit('createUser')}>
            <input name="id" placeholder="ID (optional, e.g. 2500)" inputMode="numeric" />
            <input name="username" placeholder="Username" required />
            <input name="password" type="password" placeholder="Password (blank = none)" />
            <button className="btn green">Create user</button>
          </form>
          <div className="scroll card">
            <table>
              <thead><tr><th>ID</th><th>Username</th><th>Robux</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td><td>{u.username}</td><td>{u.robux}</td>
                    <td>{[u.id === data.me && 'owner', u.banned && 'banned', u.no_password && 'no password'].filter(Boolean).join(', ') || '-'}</td>
                    <td className="acts">
                      <button className="btn" onClick={() => act('setBanned', { id: u.id, banned: !u.banned })}>{u.banned ? 'Unban' : 'Ban'}</button>
                      <button className="btn" onClick={() => { const i = prompt('Item ID to give ' + u.username + ' (see the Catalog tab)'); if (i) act('giveItem', { id: u.id, itemId: i }); }}>Give item</button>
                      <button className="btn" onClick={() => { const r = prompt('Robux for ' + u.username, u.robux); if (r !== null) act('setRobux', { id: u.id, robux: r }); }}>Robux</button>
                      <button className="btn" onClick={() => { const p = prompt('New password (min 8 characters)'); if (p) act('setPassword', { id: u.id, password: p }); }}>Set password</button>
                      <button className="btn" onClick={() => confirm('Remove the password for ' + u.username + '? They will not be able to log in.') && act('nullifyPassword', { id: u.id })}>Nullify password</button>
                      <button className="btn" onClick={() => confirm('Delete ' + u.username + '?') && act('deleteUser', { id: u.id })}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'games' && (
        <>
          <form className="card row" onSubmit={submit('addGame')}>
            <input name="name" placeholder="Game name" required />
            <input name="creator" placeholder="Creator (default: you)" />
            <input name="description" placeholder="Description" />
            <button className="btn green">Add game</button>
          </form>
          <div className="scroll card">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Creator</th><th>Plays</th><th></th></tr></thead>
              <tbody>
                {data.games.map((g) => (
                  <tr key={g.id}><td>{g.id}</td><td>{g.name}</td><td>{g.creator}</td><td>{g.plays}</td>
                    <td><button className="btn" onClick={() => confirm('Delete ' + g.name + '?') && act('deleteGame', { id: g.id })}>Delete</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'items' && (
        <>
          <form className="card row" onSubmit={submit('addItem')}>
            <input name="name" placeholder="Item name" required />
            <input name="kind" placeholder="Type (Hat, Shirt...)" required />
            <input name="price" placeholder="Price (R$)" inputMode="numeric" />
            <button className="btn green">Add item</button>
          </form>
          <div className="scroll card">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Price</th><th></th></tr></thead>
              <tbody>
                {data.items.map((i) => (
                  <tr key={i.id}><td>{i.id}</td><td>{i.name}</td><td>{i.kind}</td><td>{i.price}</td>
                    <td><button className="btn" onClick={() => confirm('Delete ' + i.name + '?') && act('deleteItem', { id: i.id })}>Delete</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
