import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useSSE } from '../hooks/useSSE';
import { useLiveStore } from '../store/liveStore';
import { api } from '../api/client';
import NowRacing from '../components/live/NowRacing';
import LapFeed from '../components/live/LapFeed';
export default function LivePage() {
    const store = useLiveStore();
    // Load recent laps from history on mount
    useEffect(() => {
        api.recentLaps(30).then(store.initFromHistory);
        api.activeSession().then(s => s && store.setCurrentSession(s));
    }, []);
    useSSE('/api/live', {
        session_start: data => { store.onSessionStart(data); store.setConnected(true); },
        session_end: data => store.onSessionEnd(data),
        lap_completed: data => store.onLapCompleted(data),
        driver_joined: data => store.onDriverJoined(data),
        driver_left: data => store.onDriverLeft(data),
        ac_status: data => store.onAcStatus(data),
        ping: () => store.setConnected(true),
    });
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 24 }, children: [_jsxs("section", { children: [_jsx("h2", { style: { fontWeight: 700, marginBottom: 16, fontSize: 15, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }, children: "Now Racing" }), _jsx(NowRacing, {})] }), _jsxs("section", { children: [_jsx("h2", { style: { fontWeight: 700, marginBottom: 16, fontSize: 15, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }, children: "Recent Laps" }), _jsx("div", { className: "card", children: _jsx(LapFeed, {}) })] })] }));
}
