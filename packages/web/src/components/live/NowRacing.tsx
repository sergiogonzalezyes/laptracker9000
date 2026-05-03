import { useState } from 'react';
import { useLiveStore } from '../../store/liveStore';
import { trackDisplayName } from '../../api/client';
import DriverCard from './DriverCard';

type SortMode = 'lap' | 'count' | 'alpha';

interface Props {
  focusedDriver: string | null;
  onFocus: (name: string | null) => void;
}

export default function NowRacing({ focusedDriver, onFocus }: Props) {
  const { currentSession, drivers, acStatus } = useLiveStore();
  const [sortMode, setSortMode] = useState<SortMode>('lap');

  const track = acStatus?.track || currentSession?.track || '';
  const sessionType = acStatus?.sessionType || currentSession?.session_type || '';
  const isActive = (acStatus?.clients ?? 0) > 0 || !!currentSession;

  const sorted = [...drivers.values()].sort((a, b) => {
    if (sortMode === 'lap')   return a.bestLapMs - b.bestLapMs;
    if (sortMode === 'count') return b.lapCount - a.lapCount;
    return a.name.localeCompare(b.name);
  });
  const leaderBestMs = [...drivers.values()]
    .sort((a, b) => a.bestLapMs - b.bestLapMs)[0]?.bestLapMs ?? Infinity;

  if (!isActive && sorted.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.06em' }}>
          No active session — server is offline or no laps in progress
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Session header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <span className={`badge badge-${sessionType.toLowerCase()}`}>{sessionType || 'PRACTICE'}</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          {trackDisplayName(track)}
        </span>
        {acStatus?.name && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{acStatus.name}</span>
        )}
        {(acStatus?.clients ?? 0) > 0 && (
          <span className="tag" style={{ marginLeft: 'auto' }}>
            <span className="dot dot-red" />
            {acStatus!.clients} on track
          </span>
        )}
      </div>

      {/* Sort controls */}
      {sorted.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, alignItems: 'center' }}>
          {(['lap', 'count', 'alpha'] as SortMode[]).map(m => (
            <button key={m} onClick={() => setSortMode(m)} style={{
              fontSize: 11, fontWeight: 600, padding: '4px 12px',
              background: sortMode === m ? 'var(--accent-dim)' : 'transparent',
              color: sortMode === m ? 'var(--accent-hot)' : 'var(--text-muted)',
              border: `1px solid ${sortMode === m ? '#440000' : 'var(--border)'}`,
              borderRadius: 3,
            }}>
              {m === 'lap' ? 'Best Lap' : m === 'count' ? 'Lap Count' : 'Name'}
            </button>
          ))}
          {focusedDriver && (
            <button onClick={() => onFocus(null)} style={{
              marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '4px 12px',
              background: 'var(--accent-dim)', color: 'var(--accent-hot)',
              border: '1px solid #440000', borderRadius: 3,
            }}>
              ✕ {focusedDriver}
            </button>
          )}
        </div>
      )}

      {/* Driver grid */}
      {sorted.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {sorted.map((d, i) => (
            <div
              key={d.name}
              onClick={() => onFocus(focusedDriver === d.name ? null : d.name)}
              style={{
                outline: focusedDriver === d.name ? '2px solid var(--accent)' : '2px solid transparent',
                borderRadius: 6,
              }}
            >
              <DriverCard driver={d} rank={i + 1} leaderBestMs={leaderBestMs} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Waiting for drivers...</div>
      )}
    </div>
  );
}
