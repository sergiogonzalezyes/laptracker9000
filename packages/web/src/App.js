import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Shell from './components/layout/Shell';
import LivePage from './pages/LivePage';
import SessionsPage from './pages/SessionsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import DriverPage from './pages/DriverPage';
import DriversPageWrapper from './pages/DriversPageWrapper';
import TracksPage from './pages/TracksPage';
import StatsPage from './pages/StatsPage';
import SessionDetail from './components/history/SessionDetail';
function KeyboardShortcuts() {
    const navigate = useNavigate();
    useEffect(() => {
        const handler = (e) => {
            if (e.target.tagName === 'INPUT')
                return;
            if (e.key === 'l' || e.key === 'L')
                navigate('/leaderboard');
            if (e.key === 'd' || e.key === 'D')
                navigate('/drivers');
            if (e.key === 't' || e.key === 'T')
                navigate('/tracks');
            if (e.key === 's' || e.key === 'S')
                navigate('/sessions');
            if (e.key === ' ') {
                e.preventDefault();
                navigate('/live');
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [navigate]);
    return null;
}
function HomeRoute() {
    try {
        const stored = JSON.parse(localStorage.getItem('laptracker_driver') ?? 'null');
        if (stored?.claimed && stored?.name) {
            return _jsx(Navigate, { to: `/drivers/${encodeURIComponent(stored.name)}`, replace: true });
        }
    }
    catch { }
    return _jsx(LivePage, {});
}
export default function App() {
    return (_jsxs(BrowserRouter, { children: [_jsx(KeyboardShortcuts, {}), _jsx(Routes, { children: _jsxs(Route, { element: _jsx(Shell, {}), children: [_jsx(Route, { path: "/", element: _jsx(HomeRoute, {}) }), _jsx(Route, { path: "/live", element: _jsx(LivePage, {}) }), _jsx(Route, { path: "/leaderboard", element: _jsx(LeaderboardPage, {}) }), _jsx(Route, { path: "/drivers", element: _jsx(DriversPageWrapper, {}) }), _jsx(Route, { path: "/drivers/:name", element: _jsx(DriverPage, {}) }), _jsx(Route, { path: "/tracks", element: _jsx(TracksPage, {}) }), _jsx(Route, { path: "/sessions", element: _jsx(SessionsPage, {}) }), _jsx(Route, { path: "/sessions/:id", element: _jsx(SessionDetail, {}) }), _jsx(Route, { path: "/stats", element: _jsx(StatsPage, {}) }), _jsx(Route, { path: "/history", element: _jsx(Navigate, { to: "/sessions", replace: true }) }), _jsx(Route, { path: "/history/:id", element: _jsx(SessionDetail, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) })] }));
}
