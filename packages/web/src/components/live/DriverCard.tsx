import { LiveDriver } from '../../store/liveStore';
import { formatLapTime } from '../../api/client';

export default function DriverCard({ driver, rank, leaderBestMs }: { driver: LiveDriver; rank: number; leaderBestMs: number }) {
  const gap = driver.bestLapMs - leaderBestMs;
  const isLeader = gap === 0;

  return (
    <div className="card" style={{ padding: '14px 16px', minWidth: 200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>P{rank}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{driver.lapCount} laps</span>
      </div>
      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{driver.name}</div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: isLeader ? 'var(--accent)' : 'var(--text-primary)', marginBottom: 4 }}>
        {driver.bestLapMs === Infinity ? '--:--.---' : formatLapTime(driver.bestLapMs)}
      </div>
      {!isLeader && driver.bestLapMs !== Infinity && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          +{formatLapTime(gap)}
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        {driver.carModel.replace(/_/g, ' ')}
      </div>
    </div>
  );
}
