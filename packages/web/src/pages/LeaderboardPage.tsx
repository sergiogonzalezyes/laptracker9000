import Leaderboard from '../components/leaderboard/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div>
      <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Leaderboard
      </h2>
      <Leaderboard />
    </div>
  );
}
