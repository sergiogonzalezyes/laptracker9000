import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Session, formatLapTime, trackDisplayName } from '../../api/client';

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [trackFilter, setTrackFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const limit = 20;

  useEffect(() => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
    if (trackFilter) params.set('track', trackFilter);
    if (typeFilter) params.set('type', typeFilter);
    api.sessions('?' + params).then(r => { setSessions(r.sessions); setTotal(r.total); });
  }, [page, trackFilter, typeFilter]);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Filter by track..."
          value={trackFilter}
          onChange={e => { setTrackFilter(e.target.value); setPage(0); }}
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--text-primary)', fontSize: 13 }}
        />
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: typeFilter ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 13 }}
        >
          <option value="">All types</option>
          <option value="PRACTICE">Practice</option>
          <option value="QUALIFY">Qualify</option>
          <option value="RACE">Race</option>
        </select>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13, alignSelf: 'center' }}>
          {total} sessions
        </span>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Track</th>
              <th>Type</th>
              <th>Server</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} style={{ cursor: 'pointer' }}>
                <td style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {new Date(s.started_at).toLocaleString()}
                </td>
                <td>
                  <Link to={`/history/${s.id}`} style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {trackDisplayName(s.track)}
                    {s.track_config ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> ({s.track_config})</span> : null}
                  </Link>
                </td>
                <td><span className={`badge badge-${s.session_type.toLowerCase()}`}>{s.session_type}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{s.server_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--bg-elevated)', color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)', border: '1px solid var(--border)', fontSize: 13 }}>
            ← Prev
          </button>
          <span style={{ alignSelf: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            {page + 1} / {Math.ceil(total / limit)}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * limit >= total}
            style={{ padding: '6px 14px', borderRadius: 6, background: 'var(--bg-elevated)', color: (page + 1) * limit >= total ? 'var(--text-muted)' : 'var(--text-primary)', border: '1px solid var(--border)', fontSize: 13 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
