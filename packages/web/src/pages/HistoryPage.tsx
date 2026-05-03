import SessionList from '../components/history/SessionList';

export default function HistoryPage() {
  return (
    <div>
      <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: 15, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Session History
      </h2>
      <SessionList />
    </div>
  );
}
