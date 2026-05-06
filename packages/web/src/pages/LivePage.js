import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLiveStore } from '../store/liveStore';
import { api } from '../api/client';
import NowRacing from '../components/live/NowRacing';
import LapFeed from '../components/live/LapFeed';
export default function LivePage() {
    const store = useLiveStore();
    const [focusedDriver, setFocusedDriver] = useState(null);
    useEffect(() => {
        api.recentLaps(30).then(store.initFromHistory);
        api.activeSession().then(s => s && store.setCurrentSession(s));
    }, []);
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape')
                setFocusedDriver(null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);
    return (_jsxs("div", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs("section", { style: { flexShrink: 0 }, children: [_jsx("div", { className: "section-label", children: "Now Racing" }), _jsx(NowRacing, { focusedDriver: focusedDriver, onFocus: setFocusedDriver })] }), _jsxs("section", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { className: "section-label", style: { flexShrink: 0 }, children: ["Recent Laps", focusedDriver && (_jsxs("span", { style: { marginLeft: 8, fontSize: 10, color: 'var(--accent-hot)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }, children: ["\u2014 ", focusedDriver] }))] }), _jsx("div", { className: "card", style: { flex: 1, minHeight: 0, overflow: 'hidden' }, children: _jsx(LapFeed, { filterDriver: focusedDriver }) })] })] }));
}
