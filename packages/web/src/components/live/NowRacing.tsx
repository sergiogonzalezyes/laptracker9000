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
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: '0.1em',
          marginBottom: 12,
          color: '#1a1a1a',
        }}>⏱</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#2a2a2a', letterSpacing: '0.15em' }}>
          NO ACTIVE SESSION
        </div>
        <div style={{ fontSize: 12, marginTop: 8, color: '#333', letterSpacing: '0.05em' }}>
          Server is offline or no laps in progress
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Session header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <span className={`badge badge-${sessionType.toLowerCase()}`}>{sessionType || 'PRACTICE'}</span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: '0.05em',
          color: 'var(--text-primary)',
        }}>
          {trackDisplayName(track).toUpperCase()}
        </span>
        {acStatus?.name && (
          <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
            {acStatus.name}
          </span>
        )}
        {(acStatus?.clients ?? 0) > 0 && (
          <span className="tag" style={{ marginLeft: 'auto' }}>
            <span className="dot dot-red" />
            {acStatus!.clients} ON TRACK
          </span>
        )}
      </div>

      {/* Driver grid */}
      {sortedDrivers.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {sortedDrivers.map((d, i) => (
            <DriverCard key={d.name} driver={d} rank={i + 1} leaderBestMs={leaderBestMs} />
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
          WAITING FOR DRIVERS...
        </div>
      )}
    </div>
  );
}
