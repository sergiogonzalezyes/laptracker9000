import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import { useSSE } from '../../hooks/useSSE';
import { useLiveStore } from '../../store/liveStore';
export default function Shell() {
    const store = useLiveStore();
    useSSE('/api/live', {
        session_start: data => { store.onSessionStart(data); store.setConnected(true); },
        session_end: data => store.onSessionEnd(data),
        lap_completed: data => store.onLapCompleted(data),
        driver_joined: data => store.onDriverJoined(data),
        driver_left: data => store.onDriverLeft(data),
        ac_status: data => store.onAcStatus(data),
        ping: () => store.setConnected(true),
    });
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' }, children: [_jsx(NavBar, {}), _jsx("main", { style: { flex: 1, padding: '24px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }, children: _jsx(Outlet, {}) })] }));
}
