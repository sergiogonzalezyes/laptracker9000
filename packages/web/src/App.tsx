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
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'l' || e.key === 'L') navigate('/leaderboard');
      if (e.key === 'd' || e.key === 'D') navigate('/drivers');
      if (e.key === 't' || e.key === 'T') navigate('/tracks');
      if (e.key === 's' || e.key === 'S') navigate('/sessions');
      if (e.key === ' ')                   { e.preventDefault(); navigate('/live'); }
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
      return <Navigate to={`/drivers/${encodeURIComponent(stored.name)}`} replace />;
    }
  } catch {}
  return <LivePage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <KeyboardShortcuts />
      <Routes>
        <Route element={<Shell />}>
          <Route path="/"                element={<HomeRoute />} />
          <Route path="/live"            element={<LivePage />} />
          <Route path="/leaderboard"     element={<LeaderboardPage />} />
          <Route path="/drivers"         element={<DriversPageWrapper />} />
          <Route path="/drivers/:name"   element={<DriverPage />} />
          <Route path="/tracks"          element={<TracksPage />} />
          <Route path="/sessions"        element={<SessionsPage />} />
          <Route path="/sessions/:id"    element={<SessionDetail />} />
          <Route path="/stats"           element={<StatsPage />} />
          {/* Legacy redirects */}
          <Route path="/history"         element={<Navigate to="/sessions" replace />} />
          <Route path="/history/:id"     element={<SessionDetail />} />
          <Route path="*"                element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
