import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Shell from './components/layout/Shell';
import LivePage from './pages/LivePage';
import HistoryPage from './pages/HistoryPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SessionDetail from './components/history/SessionDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/"              element={<LivePage />} />
          <Route path="/history"       element={<HistoryPage />} />
          <Route path="/history/:id"   element={<SessionDetail />} />
          <Route path="/leaderboard"   element={<LeaderboardPage />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
