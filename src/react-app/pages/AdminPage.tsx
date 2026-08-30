import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Plus, Minus, RefreshCw, ScrollText, Users, Ban, ShieldCheck, Trash2, Search, Link2 } from 'lucide-react';
import { api, AdminUser, LedgerEntry, HiggsfieldStatus } from '../api';

/**
 * Hidden owner-only admin dashboard (/admin — not linked anywhere in the UI).
 * The backend answers 404 for non-owners, so this page silently redirects home
 * for anyone who stumbles onto the URL. English-only: it's an internal tool.
 */
export function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [showLedger, setShowLedger] = useState(false);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [query, setQuery] = useState('');
  const [higgsfield, setHiggsfield] = useState<HiggsfieldStatus | null>(null);
  // grant-by-email form (for users who haven't signed up yet)
  const [gEmail, setGEmail] = useState('');
  const [gAmount, setGAmount] = useState(1);

  const load = () => {
    api.adminUsers()
      .then(setUsers)
      .catch(() => navigate('/', { replace: true })); // 404 for non-owners
    api.adminHiggsfieldStatus().then(setHiggsfield).catch(() => {});
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshLedger = () => { if (showLedger) api.adminLedger().then(setLedger).catch(() => {}); };

  const grant = async (email: string, delta: number) => {
    if (!delta) return;
    setBusy(email); setMsg('');
    try {
      const r = await api.adminGrant(email, delta);
      setMsg(`${r.email} → ${r.credits} credits`);
      load(); refreshLedger();
    } catch (e: any) { setMsg(`Error: ${e.message}`); }
    finally { setBusy(''); }
  };

  const toggleBan = async (u: AdminUser) => {
    const banning = !u.banned;
    if (banning && !confirm(`Ban ${u.email}? They'll be logged out and blocked from logging in or creating anything.`)) return;
    setBusy(u.email); setMsg('');
    try {
      await api.adminBan(u.email, banning);
      setMsg(`${u.email} ${banning ? 'banned' : 'unbanned'}`);
      load();
    } catch (e: any) { setMsg(`Error: ${e.message}`); }
    finally { setBusy(''); }
  };

  const removeUser = async (u: AdminUser) => {
    if (!confirm(`PERMANENTLY DELETE ${u.email}?\n\nThis erases their ${u.books} book(s), ${u.children} child profile(s), credits and history. This cannot be undone.`)) return;
    if (!confirm(`Are you absolutely sure? Type-check: this deletes ALL data for ${u.email}.`)) return;
    setBusy(u.email); setMsg('');
    try {
      await api.adminDeleteUser(u.email);
      setMsg(`${u.email} deleted`);
      load(); refreshLedger();
    } catch (e: any) { setMsg(`Error: ${e.message}`); }
    finally { setBusy(''); }
  };

  const toggleLedger = () => {
    if (!showLedger) api.adminLedger().then(setLedger).catch(() => {});
    setShowLedger(!showLedger);
  };

  const connectHiggsfield = async () => {
    setBusy('higgsfield'); setMsg('');
    try {
      const { authorizeUrl } = await api.adminConnectHiggsfield();
      window.location.assign(authorizeUrl);
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
      setBusy('');
    }
  };

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    return q ? users.filter((u) => u.email.includes(q)) : users;
  }, [users, query]);

  if (!users) return <div className="auth-page"><div className="spinner" /></div>;

  const totalCredits = users.reduce((s, u) => s + u.credits, 0);
  const totalBooks = users.reduce((s, u) => s + u.books, 0);
  const bannedCount = users.filter((u) => u.banned).length;

  const chip = (icon: ReactNode, label: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: 999, padding: '7px 16px', fontSize: '.88rem', fontWeight: 700, color: '#6b21a8' }}>
      {icon} {label}
    </span>
  );

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 16px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Coins size={26} color="#9333ea" /> Admin
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={15} /> Refresh</button>
          <button className="btn btn-secondary btn-sm" onClick={toggleLedger}><ScrollText size={15} /> {showLedger ? 'Hide' : 'Show'} ledger</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
        {chip(<Users size={16} />, `${users.length} users`)}
        {chip(<Coins size={16} />, `${totalCredits} credits outstanding`)}
        {chip(<ScrollText size={16} />, `${totalBooks} books created`)}
        {bannedCount > 0 && chip(<Ban size={16} />, `${bannedCount} banned`)}
      </div>

      {/* Owner-paid Higgsfield MCP connection and hard daily spend ceiling */}
      <div style={{ background: '#fff', border: '1.5px solid #ddd6fe', borderRadius: 14, padding: 16, marginBottom: 16, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800, color: '#4c1d95', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link2 size={17} /> Higgsfield MCP
          </div>
          <div style={{ fontSize: '.84rem', color: '#6b7280', marginTop: 4 }}>
            {higgsfield?.connected
              ? `Connected${higgsfield.accountEmail ? ` as ${higgsfield.accountEmail}` : ''} · ${higgsfield.todayCreditsReserved}/${higgsfield.dailyLimit} credits reserved today across ${higgsfield.todayJobs} jobs`
              : 'Not connected · illustrations are disabled until the owner authorizes Higgsfield'}
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" disabled={busy === 'higgsfield'} onClick={connectHiggsfield}>
          <Link2 size={15} /> {higgsfield?.connected ? 'Reconnect' : 'Connect Higgsfield'}
        </button>
      </div>

      {/* Grant by email (works before the user ever signs up) */}
      <div style={{ background: '#fff', border: '1.5px solid #e9d5ff', borderRadius: 14, padding: 16, marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="input" style={{ flex: '1 1 220px', margin: 0 }} placeholder="user@email.com"
          value={gEmail} onChange={(e) => setGEmail(e.target.value)} />
        <input className="input" style={{ width: 90, margin: 0 }} type="number" value={gAmount}
          onChange={(e) => setGAmount(Math.round(Number(e.target.value)) || 0)} />
        <button className="btn btn-primary btn-sm" disabled={!!busy || !gEmail.trim() || !gAmount}
          onClick={() => grant(gEmail.trim(), gAmount)}>
          <Plus size={15} /> Grant credits
        </button>
        {msg && <span style={{ fontSize: '.85rem', color: msg.startsWith('Error') ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{msg}</span>}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 14, maxWidth: 340 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
        <input className="input" style={{ margin: 0, paddingLeft: 36 }} placeholder="Search by email"
          value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {/* Users table */}
      <div style={{ background: '#fff', border: '1.5px solid #eee', borderRadius: 14, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem' }}>
          <thead>
            <tr style={{ background: '#faf5ff', textAlign: 'left' }}>
              {['Email', 'Credits', 'Books', 'Kids', 'Last book', 'Credits', 'Account'].map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', fontWeight: 800, color: '#6b21a8', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.email} style={{ borderTop: '1px solid #f3f0fa', background: u.banned ? '#fef2f2' : undefined }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                  {u.email}
                  {u.banned ? <span style={{ marginLeft: 8, background: '#dc2626', color: '#fff', fontSize: '.64rem', fontWeight: 800, padding: '2px 7px', borderRadius: 999, verticalAlign: 'middle' }}>BANNED</span> : null}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontWeight: 800, color: u.credits > 0 ? '#16a34a' : '#9ca3af' }}>{u.credits}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>{u.books}</td>
                <td style={{ padding: '10px 14px' }}>{u.children}</td>
                <td style={{ padding: '10px 14px', color: '#8b7d6b', whiteSpace: 'nowrap' }}>{u.last_book_at ? u.last_book_at.slice(0, 16) : '-'}</td>
                <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                  {[1, 5].map((n) => (
                    <button key={n} className="btn btn-secondary btn-sm" style={{ marginRight: 6 }}
                      disabled={busy === u.email} onClick={() => grant(u.email, n)}>
                      <Plus size={13} /> {n}
                    </button>
                  ))}
                  <button className="btn btn-secondary btn-sm" disabled={busy === u.email || u.credits < 1}
                    onClick={() => grant(u.email, -1)}>
                    <Minus size={13} /> 1
                  </button>
                </td>
                <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                  <button className="btn btn-secondary btn-sm" style={{ marginRight: 6, color: u.banned ? '#16a34a' : '#b45309' }}
                    disabled={busy === u.email} onClick={() => toggleBan(u)}>
                    {u.banned ? <><ShieldCheck size={13} /> Unban</> : <><Ban size={13} /> Ban</>}
                  </button>
                  <button className="btn btn-secondary btn-sm" style={{ color: '#dc2626' }}
                    disabled={busy === u.email} onClick={() => removeUser(u)}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>{query ? 'No matches' : 'No users yet'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ledger */}
      {showLedger && (
        <div style={{ background: '#fff', border: '1.5px solid #eee', borderRadius: 14, overflow: 'auto', marginTop: 22 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
            <thead>
              <tr style={{ background: '#faf5ff', textAlign: 'left' }}>
                {['When', 'Email', 'Δ', 'Reason', 'By'].map((h) => (
                  <th key={h} style={{ padding: '9px 14px', fontWeight: 800, color: '#6b21a8', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledger.map((l) => (
                <tr key={l.id} style={{ borderTop: '1px solid #f3f0fa' }}>
                  <td style={{ padding: '8px 14px', whiteSpace: 'nowrap', color: '#8b7d6b' }}>{l.created_at?.slice(0, 16)}</td>
                  <td style={{ padding: '8px 14px' }}>{l.email}</td>
                  <td style={{ padding: '8px 14px', fontWeight: 800, color: l.delta > 0 ? '#16a34a' : '#dc2626' }}>{l.delta > 0 ? `+${l.delta}` : l.delta}</td>
                  <td style={{ padding: '8px 14px' }}>{l.reason}</td>
                  <td style={{ padding: '8px 14px', color: '#8b7d6b' }}>{l.admin_email || 'system'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
