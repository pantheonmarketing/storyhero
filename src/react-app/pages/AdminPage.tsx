import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ScrollText, Users, Ban, ShieldCheck, Trash2, Search, Link2, Clock3, UserX, BookOpen } from 'lucide-react';
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

  const load = () => {
    api.adminUsers()
      .then(setUsers)
      .catch(() => navigate('/', { replace: true })); // 404 for non-owners
    api.adminHiggsfieldStatus().then(setHiggsfield).catch(() => {});
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshLedger = () => { if (showLedger) api.adminLedger().then(setLedger).catch(() => {}); };

  const toggleApproval = async (u: AdminUser) => {
    const approving = !u.approved;
    if (!approving && !confirm(`Revoke generation access for ${u.email}? Their existing books stay readable.`)) return;
    setBusy(u.email); setMsg('');
    try {
      const r = await api.adminApprove(u.email, approving);
      setMsg(`${r.email} ${approving ? `approved with ${r.booksRemaining} books remaining` : 'moved back to pending'}`);
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

  const totalBooks = users.reduce((s, u) => s + u.books, 0);
  const bannedCount = users.filter((u) => u.banned).length;
  const pendingCount = users.filter((u) => !u.approved && !u.banned).length;
  const approvedCount = users.filter((u) => u.approved && !u.banned).length;

  const chip = (icon: ReactNode, label: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#faf5ff', border: '1.5px solid #e9d5ff', borderRadius: 999, padding: '7px 16px', fontSize: '.88rem', fontWeight: 700, color: '#6b21a8' }}>
      {icon} {label}
    </span>
  );

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 16px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={26} color="#9333ea" /> Parent access
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={15} /> Refresh</button>
          <button className="btn btn-secondary btn-sm" onClick={toggleLedger}><ScrollText size={15} /> {showLedger ? 'Hide' : 'Show'} ledger</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
        {chip(<Users size={16} />, `${users.length} users`)}
        {chip(<Clock3 size={16} />, `${pendingCount} awaiting approval`)}
        {chip(<ShieldCheck size={16} />, `${approvedCount} approved`)}
        {chip(<BookOpen size={16} />, `${totalBooks} books created`)}
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

      {msg && <div style={{ marginBottom: 16, fontSize: '.88rem', color: msg.startsWith('Error') ? '#dc2626' : '#166534', fontWeight: 700 }}>{msg}</div>}

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
              {['Email', 'Access', 'Books', 'Remaining', 'Kids', 'Last book', 'Actions'].map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', fontWeight: 800, color: '#6b21a8', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.email} style={{ borderTop: '1px solid #f3f0fa', background: u.banned ? '#fef2f2' : !u.approved ? '#fffbeb' : undefined }}>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                  {u.email}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: u.banned ? '#dc2626' : u.approved ? '#dcfce7' : '#fef3c7', color: u.banned ? '#fff' : u.approved ? '#166534' : '#92400e', fontSize: '.7rem', fontWeight: 800, padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    {u.banned ? <Ban size={12} /> : u.approved ? <ShieldCheck size={12} /> : <Clock3 size={12} />}
                    {u.banned ? 'Banned' : u.unlimited ? 'Owner' : u.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 700 }}>{u.unlimited ? u.books : `${u.books} / 6`}</td>
                <td style={{ padding: '10px 14px', fontWeight: 800, color: u.unlimited || (u.books_remaining ?? 0) > 0 ? '#16a34a' : '#9ca3af' }}>{u.unlimited ? 'Unlimited' : u.books_remaining}</td>
                <td style={{ padding: '10px 14px' }}>{u.children}</td>
                <td style={{ padding: '10px 14px', color: '#8b7d6b', whiteSpace: 'nowrap' }}>{u.last_book_at ? u.last_book_at.slice(0, 16) : '-'}</td>
                <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                  {u.unlimited ? (
                    <span style={{ color: '#9ca3af', fontWeight: 700 }}>Protected owner</span>
                  ) : (
                    <>
                      <button className="btn btn-secondary btn-sm" style={{ marginRight: 6, color: u.approved ? '#92400e' : '#166534' }}
                        disabled={busy === u.email || !!u.banned} onClick={() => toggleApproval(u)}>
                        {u.approved ? <><UserX size={13} /> Revoke</> : <><ShieldCheck size={13} /> Approve</>}
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ marginRight: 6, color: u.banned ? '#16a34a' : '#b45309' }}
                        disabled={busy === u.email} onClick={() => toggleBan(u)}>
                        {u.banned ? <><ShieldCheck size={13} /> Unban</> : <><Ban size={13} /> Ban</>}
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ color: '#dc2626' }}
                        disabled={busy === u.email} onClick={() => removeUser(u)}>
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
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
