import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Shell from './components/layout/Shell';
import LivePage from './pages/LivePage';
import HistoryPage from './pages/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import DriverPage from './pages/DriverPage';
import SessionDetail from './components/history/SessionDetail';

function KeyboardShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'l' || e.key === 'L') navigate('/leaderboard');
      if (e.key === 'h' || e.key === 'H') navigate('/history');
      if (e.key === ' ')                   { e.preventDefault(); navigate('/'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <KeyboardShortcuts />
      <Routes>
        <Route element={<Shell />}>
          <Route path="/"              element={<LivePage />} />
          <Route path="/history"       element={<HistoryPage />} />
          <Route path="/history/:id"   element={<SessionDetail />} />
          <Route path="/leaderboard"   element={<LeaderboardPage />} />
          <Route path="/drivers/:name" element={<DriverPage />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
