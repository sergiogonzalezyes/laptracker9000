import SessionList from '../components/history/SessionList';

export default function HistoryPage() {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div className="section-label" style={{ flexShrink: 0, marginBottom: 12 }}>Session History</div>
      <SessionList />
    </div>
  );
}
