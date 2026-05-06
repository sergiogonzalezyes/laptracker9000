import SessionList from '../components/history/SessionList';

export default function SessionsPage() {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0, marginBottom: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Sessions</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>All recorded sessions</div>
      </div>
      <SessionList />
    </div>
  );
}
