import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, Session, trackDisplayName } from '../../api/client';

type SortKey = 'started_at' | 'track' | 'session_type';
type SortDir = 'asc' | 'desc';

function SortTh({ label, col, sort, dir, onSort }: {
  label: string; col: SortKey; sort: SortKey; dir: SortDir; onSort: (c: SortKey) => void;
}) {
  const active = sort === col;
  return (
    <th onClick={() => onSort(col)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ color: active ? 'var(--accent-hot)' : 'var(--text-muted)' }}>{label}</span>
      {' '}
      <span style={{ fontSize: 9, color: active ? 'var(--accent-hot)' : '#333' }}>
        {active ? (dir === 'asc' ? '▲' : '▼') : '▲▼'}
      </span>
    </th>
  );
}

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [trackFilter, setTrackFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState<SortKey>('started_at');
  const [dir, setDir] = useState<SortDir>('desc');
  const limit = 20;

  useEffect(() => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
    if (trackFilter) params.set('track', trackFilter);
    if (typeFilter)  params.set('type', typeFilter);
    api.sessions('?' + params).then(r => { setSessions(r.sessions); setTotal(r.total); });
  }, [page, trackFilter, typeFilter]);

  const handleSort = useCallback((col: SortKey) => {
    if (sort === col) setDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSort(col); setDir('asc'); }
  }, [sort]);

  const sorted = [...sessions].sort((a, b) => {
    const av = a[sort] ?? '';
    const bv = b[sort] ?? '';
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return dir === 'asc' ? cmp : -cmp;
  });

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Filter by track..."
          value={trackFilter}
          onChange={e => { setTrackFilter(e.target.value); setPage(0); }}
          style={{ minWidth: 180 }}
        />
        <div style={{ display: 'flex', gap: 2 }}>
          {[['', 'ALL'], ['PRACTICE', 'PRACTICE'], ['QUALIFY', 'QUALIFY'], ['RACE', 'RACE']].map(([val, label]) => (
            <button key={val} onClick={() => { setTypeFilter(val); setPage(0); }} style={{
              fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
              padding: '5px 10px',
              background: typeFilter === val ? 'linear-gradient(180deg, #aa0000, #770000)' : 'var(--bg-elevated)',
              color: typeFilter === val ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${typeFilter === val ? '#cc0000' : 'var(--border-chrome)'}`,
              borderRadius: 0,
              clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)',
            }}>
              {label}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', color: '#333', fontSize: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
          {total} SESSIONS
        </span>
      </div>

      <div className="card" style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto' }}>
        <table style={{ minWidth: 480 }}>
          <thead>
            <tr>
              <SortTh label="DATE"   col="started_at"   sort={sort} dir={dir} onSort={handleSort} />
              <SortTh label="TRACK"  col="track"         sort={sort} dir={dir} onSort={handleSort} />
              <SortTh label="TYPE"   col="session_type"  sort={sort} dir={dir} onSort={handleSort} />
              <th>SERVER</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(s => (
              <tr key={s.id} style={{ cursor: 'pointer' }}>
                <td style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                  {new Date(s.started_at).toLocaleString()}
                </td>
                <td>
                  <Link to={`/history/${s.id}`} style={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-hot)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}>
                    {trackDisplayName(s.track)}
                    {s.track_config ? <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> ({s.track_config})</span> : null}
                  </Link>
                </td>
                <td><span className={`badge badge-${s.session_type.toLowerCase()}`}>{s.session_type}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{s.server_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {total > limit && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, alignItems: 'center' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{
            fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.08em',
            padding: '6px 16px', background: 'var(--bg-elevated)',
            color: page === 0 ? '#333' : 'var(--text-primary)', border: '1px solid var(--border-chrome)', borderRadius: 0,
          }}>← PREV</button>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
            {page + 1} / {Math.ceil(total / limit)}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * limit >= total} style={{
            fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.08em',
            padding: '6px 16px', background: 'var(--bg-elevated)',
            color: (page + 1) * limit >= total ? '#333' : 'var(--text-primary)', border: '1px solid var(--border-chrome)', borderRadius: 0,
          }}>NEXT →</button>
        </div>
      )}
    </div>
  );
}
