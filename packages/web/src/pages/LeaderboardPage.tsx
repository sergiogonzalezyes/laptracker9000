import Leaderboard from '../components/leaderboard/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div className="section-label" style={{ flexShrink: 0, marginBottom: 12 }}>Leaderboard</div>
      <Leaderboard />
    </div>
  );
}
