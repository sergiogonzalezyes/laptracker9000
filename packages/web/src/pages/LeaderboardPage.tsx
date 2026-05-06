import Leaderboard from '../components/leaderboard/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Leaderboard</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Real-time lap times from Assetto Corsa</div>
      </div>
      <Leaderboard />
    </div>
  );
}
