import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, trackDisplayName } from '../../api/client';
export default function SessionList() {
    const [sessions, setSessions] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [trackFilter, setTrackFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const limit = 20;
    useEffect(() => {
        const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
        if (trackFilter)
            params.set('track', trackFilter);
        if (typeFilter)
            params.set('type', typeFilter);
        api.sessions('?' + params).then(r => { setSessions(r.sessions); setTotal(r.total); });
    }, [page, trackFilter, typeFilter]);
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', gap: 8, marginBottom: 16 }, children: [_jsx("input", { placeholder: "Filter by track...", value: trackFilter, onChange: e => { setTrackFilter(e.target.value); setPage(0); }, style: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: 'var(--text-primary)', fontSize: 13 } }), _jsxs("select", { value: typeFilter, onChange: e => { setTypeFilter(e.target.value); setPage(0); }, style: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', color: typeFilter ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: 13 }, children: [_jsx("option", { value: "", children: "All types" }), _jsx("option", { value: "PRACTICE", children: "Practice" }), _jsx("option", { value: "QUALIFY", children: "Qualify" }), _jsx("option", { value: "RACE", children: "Race" })] }), _jsxs("span", { style: { marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13, alignSelf: 'center' }, children: [total, " sessions"] })] }), _jsx("div", { className: "card", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), _jsx("th", { children: "Track" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Server" })] }) }), _jsx("tbody", { children: sessions.map(s => (_jsxs("tr", { style: { cursor: 'pointer' }, children: [_jsx("td", { style: { color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }, children: new Date(s.started_at).toLocaleString() }), _jsx("td", { children: _jsxs(Link, { to: `/history/${s.id}`, style: { color: 'var(--text-primary)', fontWeight: 500 }, children: [trackDisplayName(s.track), s.track_config ? _jsxs("span", { style: { color: 'var(--text-muted)', fontSize: 11 }, children: [" (", s.track_config, ")"] }) : null] }) }), _jsx("td", { children: _jsx("span", { className: `badge badge-${s.session_type.toLowerCase()}`, children: s.session_type }) }), _jsx("td", { style: { color: 'var(--text-muted)', fontSize: 12 }, children: s.server_name })] }, s.id))) })] }) }), total > limit && (_jsxs("div", { style: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }, children: [_jsx("button", { onClick: () => setPage(p => Math.max(0, p - 1)), disabled: page === 0, style: { padding: '6px 14px', borderRadius: 6, background: 'var(--bg-elevated)', color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)', border: '1px solid var(--border)', fontSize: 13 }, children: "\u2190 Prev" }), _jsxs("span", { style: { alignSelf: 'center', fontSize: 13, color: 'var(--text-muted)' }, children: [page + 1, " / ", Math.ceil(total / limit)] }), _jsx("button", { onClick: () => setPage(p => p + 1), disabled: (page + 1) * limit >= total, style: { padding: '6px 14px', borderRadius: 6, background: 'var(--bg-elevated)', color: (page + 1) * limit >= total ? 'var(--text-muted)' : 'var(--text-primary)', border: '1px solid var(--border)', fontSize: 13 }, children: "Next \u2192" })] }))] }));
}
