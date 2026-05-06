import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, trackDisplayName } from '../../api/client';
function SortTh({ label, col, sort, dir, onSort }) {
    const active = sort === col;
    return (_jsxs("th", { onClick: () => onSort(col), style: { cursor: 'pointer', userSelect: 'none' }, children: [_jsx("span", { style: { color: active ? 'var(--accent-hot)' : 'var(--text-muted)' }, children: label }), ' ', _jsx("span", { style: { fontSize: 9, color: active ? 'var(--accent-hot)' : '#333' }, children: active ? (dir === 'asc' ? '▲' : '▼') : '▲▼' })] }));
}
export default function SessionList() {
    const [sessions, setSessions] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [trackFilter, setTrackFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sort, setSort] = useState('started_at');
    const [dir, setDir] = useState('desc');
    const limit = 20;
    useEffect(() => {
        const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
        if (trackFilter)
            params.set('track', trackFilter);
        if (typeFilter)
            params.set('type', typeFilter);
        api.sessions('?' + params).then(r => { setSessions(r.sessions); setTotal(r.total); });
    }, [page, trackFilter, typeFilter]);
    const handleSort = useCallback((col) => {
        if (sort === col)
            setDir(d => d === 'asc' ? 'desc' : 'asc');
        else {
            setSort(col);
            setDir('asc');
        }
    }, [sort]);
    const sorted = [...sessions].sort((a, b) => {
        const av = a[sort] ?? '';
        const bv = b[sort] ?? '';
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return dir === 'asc' ? cmp : -cmp;
    });
    return (_jsxs("div", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx("input", { placeholder: "Filter by track...", value: trackFilter, onChange: e => { setTrackFilter(e.target.value); setPage(0); }, style: { minWidth: 180 } }), _jsx("div", { style: { display: 'flex', gap: 2 }, children: [['', 'ALL'], ['PRACTICE', 'PRACTICE'], ['QUALIFY', 'QUALIFY'], ['RACE', 'RACE']].map(([val, label]) => (_jsx("button", { onClick: () => { setTypeFilter(val); setPage(0); }, style: {
                                fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                                padding: '5px 10px',
                                background: typeFilter === val ? 'linear-gradient(180deg, #aa0000, #770000)' : 'var(--bg-elevated)',
                                color: typeFilter === val ? '#fff' : 'var(--text-muted)',
                                border: `1px solid ${typeFilter === val ? '#cc0000' : 'var(--border-chrome)'}`,
                                borderRadius: 0,
                                clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)',
                            }, children: label }, val))) }), _jsxs("span", { style: { marginLeft: 'auto', color: '#333', fontSize: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }, children: [total, " SESSIONS"] })] }), _jsx("div", { className: "card", style: { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }, children: _jsx("div", { style: { flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto' }, children: _jsxs("table", { style: { minWidth: 480 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx(SortTh, { label: "DATE", col: "started_at", sort: sort, dir: dir, onSort: handleSort }), _jsx(SortTh, { label: "TRACK", col: "track", sort: sort, dir: dir, onSort: handleSort }), _jsx(SortTh, { label: "TYPE", col: "session_type", sort: sort, dir: dir, onSort: handleSort }), _jsx("th", { children: "SERVER" })] }) }), _jsx("tbody", { children: sorted.map(s => (_jsxs("tr", { style: { cursor: 'pointer' }, children: [_jsx("td", { style: { color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }, children: new Date(s.started_at).toLocaleString() }), _jsx("td", { children: _jsxs(Link, { to: `/sessions/${s.id}`, style: { color: 'var(--text-primary)', fontWeight: 600 }, onMouseEnter: e => (e.currentTarget.style.color = 'var(--accent-hot)'), onMouseLeave: e => (e.currentTarget.style.color = 'var(--text-primary)'), children: [trackDisplayName(s.track), s.track_config ? _jsxs("span", { style: { color: 'var(--text-muted)', fontSize: 11 }, children: [" (", s.track_config, ")"] }) : null] }) }), _jsx("td", { children: _jsx("span", { className: `badge badge-${s.session_type.toLowerCase()}`, children: s.session_type }) }), _jsx("td", { style: { color: 'var(--text-muted)', fontSize: 11 }, children: s.server_name })] }, s.id))) })] }) }) }), total > limit && (_jsxs("div", { style: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, alignItems: 'center' }, children: [_jsx("button", { onClick: () => setPage(p => Math.max(0, p - 1)), disabled: page === 0, style: {
                            fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.08em',
                            padding: '6px 16px', background: 'var(--bg-elevated)',
                            color: page === 0 ? '#333' : 'var(--text-primary)', border: '1px solid var(--border-chrome)', borderRadius: 0,
                        }, children: "\u2190 PREV" }), _jsxs("span", { style: { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }, children: [page + 1, " / ", Math.ceil(total / limit)] }), _jsx("button", { onClick: () => setPage(p => p + 1), disabled: (page + 1) * limit >= total, style: {
                            fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.08em',
                            padding: '6px 16px', background: 'var(--bg-elevated)',
                            color: (page + 1) * limit >= total ? '#333' : 'var(--text-primary)', border: '1px solid var(--border-chrome)', borderRadius: 0,
                        }, children: "NEXT \u2192" })] }))] }));
}
