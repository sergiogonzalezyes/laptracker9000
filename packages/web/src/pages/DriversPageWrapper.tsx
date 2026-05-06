import DriversPage from './DriversPage';

export default function DriversPageWrapper() {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div className="section-label" style={{ flexShrink: 0, marginBottom: 16 }}>Drivers</div>
      <DriversPage />
    </div>
  );
}
