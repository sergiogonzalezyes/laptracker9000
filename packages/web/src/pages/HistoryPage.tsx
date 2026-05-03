import SessionList from '../components/history/SessionList';

export default function HistoryPage() {
  return (
    <div>
      <div className="section-label" style={{ marginBottom: 20 }}>Session History</div>
      <SessionList />
    </div>
  );
}
