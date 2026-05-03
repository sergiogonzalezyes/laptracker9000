import { LiveDriver } from '../../store/liveStore';
import { formatLapTime } from '../../api/client';
import Sparkline from '../charts/Sparkline';

export default function DriverCard({ driver, rank, leaderBestMs, lapHistory = [] }: {
  driver: LiveDriver; rank: number; leaderBestMs: number; lapHistory?: number[];
}) {
  const gap = driver.bestLapMs - leaderBestMs;
  const isLeader = gap === 0;
  const hasTime = driver.bestLapMs !== Infinity;

  return (
    <div style={{
      background: isLeader ? '#0f0000' : 'var(--bg-surface)',
      border: `1px solid ${isLeader ? '#330000' : 'var(--border)'}`,
      borderLeft: `4px solid ${isLeader ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 6,
      padding: '16px 18px',
      minWidth: 220,
      cursor: 'pointer',
    }}>
      {/* Rank + laps */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28, fontWeight: 900,
          color: isLeader ? 'var(--accent)' : '#2a2a2a',
          lineHeight: 1,
        }}>
          {rank}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
          {driver.lapCount} lap{driver.lapCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Name */}
      <div style={{
        fontSize: 16, fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 8,
        letterSpacing: '0.01em',
      }}>
        {driver.name}
      </div>

      {/* Time */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 22, fontWeight: 700,
        color: isLeader ? 'var(--accent-hot)' : 'var(--text-primary)',
        letterSpacing: '0.02em',
        marginBottom: hasTime && !isLeader ? 4 : 0,
      }}>
        {hasTime ? formatLapTime(driver.bestLapMs) : '--:--.---'}
      </div>

      {/* Gap */}
      {!isLeader && hasTime && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
          +{formatLapTime(gap)}
        </div>
      )}
      {isLeader && (
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em' }}>
          LEADER
        </div>
      )}

      {/* Sparkline + car */}
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        {lapHistory.length >= 3 && (
          <div style={{ marginBottom: 6 }}>
            <Sparkline
              times={lapHistory}
              width={180}
              height={28}
              color={isLeader ? 'var(--accent)' : '#555'}
            />
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {driver.carModel.replace(/_/g, ' ')}
        </div>
      </div>
    </div>
  );
}
