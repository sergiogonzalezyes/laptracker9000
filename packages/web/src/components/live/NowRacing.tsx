import { useLiveStore } from '../../store/liveStore';
import { trackDisplayName } from '../../api/client';
import DriverCard from './DriverCard';

export default function NowRacing() {
  const { currentSession, drivers, acStatus } = useLiveStore();

  const track = acStatus?.track || currentSession?.track || '';
  const sessionType = acStatus?.sessionType || currentSession?.session_type || '';
  const isActive = (acStatus?.clients ?? 0) > 0 || !!currentSession;

  const sortedDrivers = [...drivers.values()].sort((a, b) => a.bestLapMs - b.bestLapMs);
  const leaderBestMs = sortedDrivers[0]?.bestLapMs ?? Infinity;

  if (!isActive && sortedDrivers.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⏱</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>No active session</div>
        <div style={{ fontSize: 13, marginTop: 8 }}>Server is offline or no laps in progress</div>
      </div>
    );
  }

  return (
    <div>
      {/* Session header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span className={`badge badge-${sessionType.toLowerCase()}`}>{sessionType || 'Practice'}</span>
        <span style={{ fontWeight: 700, fontSize: 20 }}>{trackDisplayName(track)}</span>
        {acStatus?.name && (
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>on {acStatus.name}</span>
        )}
        {(acStatus?.clients ?? 0) > 0 && (
          <span className="tag" style={{ marginLeft: 'auto' }}>
            <span className="dot dot-green" />
            {acStatus!.clients} on track
          </span>
        )}
      </div>

      {/* Driver grid */}
      {sortedDrivers.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {sortedDrivers.map((d, i) => (
            <DriverCard key={d.name} driver={d} rank={i + 1} leaderBestMs={leaderBestMs} />
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Waiting for drivers...</div>
      )}
    </div>
  );
}
