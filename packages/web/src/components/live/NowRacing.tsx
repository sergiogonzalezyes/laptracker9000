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
  const leaderBestMs = [...drivers.values()].sort((a, b) => a.bestLapMs - b.bestLapMs)[0]?.bestLapMs ?? Infinity;

  if (!isActive && sorted.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 900, marginBottom: 12, color: '#1a1a1a' }}>⏱</div>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className={`badge badge-${sessionType.toLowerCase()}`}>{sessionType || 'PRACTICE'}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '0.05em' }}>
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

      {/* Sort + filter controls */}
      {sorted.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', marginRight: 4 }}>SORT</span>
          {(['lap', 'count', 'alpha'] as SortMode[]).map(m => (
            <button key={m} onClick={() => setSortMode(m)} style={{
              fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
              padding: '3px 10px',
              background: sortMode === m ? 'rgba(204,0,0,0.2)' : 'transparent',
              color: sortMode === m ? 'var(--accent-hot)' : 'var(--text-muted)',
              border: `1px solid ${sortMode === m ? '#440000' : '#222'}`,
              borderRadius: 0,
            }}>
              {m === 'lap' ? 'BEST LAP' : m === 'count' ? 'LAP COUNT' : 'NAME'}
            </button>
          ))}
          {focusedDriver && (
            <button onClick={() => onFocus(null)} style={{
              marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.1em', padding: '3px 10px',
              background: 'rgba(204,0,0,0.1)', color: 'var(--accent-hot)',
              border: '1px solid #440000', borderRadius: 0,
            }}>
              ✕ CLEAR FILTER
            </button>
          )}
        </div>
      )}

      {/* Driver grid */}
      {sorted.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {sorted.map((d, i) => (
            <div key={d.name} onClick={() => onFocus(focusedDriver === d.name ? null : d.name)}
              style={{ cursor: 'pointer', outline: focusedDriver === d.name ? `2px solid var(--accent)` : '2px solid transparent', borderRadius: 4 }}>
              <DriverCard driver={d} rank={i + 1} leaderBestMs={leaderBestMs} />
            </div>
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
