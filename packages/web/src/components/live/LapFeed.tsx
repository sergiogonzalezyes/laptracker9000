import { useEffect, useRef } from 'react';
import { useLiveStore, LiveLap } from '../../store/liveStore';
import { formatLapTime } from '../../api/client';

function lapClass(lap: LiveLap): string {
  if (!lap.valid) return 'lap-invalid';
  if (lap.isPB) return 'lap-pb';
  if (lap.isSessionBest) return 'lap-session';
  return '';
}

function LapRow({ lap, isNew }: { lap: LiveLap; isNew: boolean }) {
  const cls = lapClass(lap);
  const pulseClass = isNew && lap.isPB ? 'lap-pulse' : isNew ? 'lap-new' : '';

  return (
    <tr className={pulseClass}>
      <td style={{ width: 32, color: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
        {lap.lapNumber || '—'}
      </td>
      <td style={{ fontWeight: 600, fontSize: 13 }}>{lap.driverName}</td>
      <td style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }} className={cls}>
        {formatLapTime(lap.lapTimeMs)}
      </td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
        {lap.split1Ms ? formatLapTime(lap.split1Ms) : '—'}
      </td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
        {lap.split2Ms ? formatLapTime(lap.split2Ms) : '—'}
      </td>
      <td style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
        {lap.carModel.replace(/_/g, ' ')}
      </td>
      <td style={{ fontSize: 10, width: 48 }}>
        {!lap.valid
          ? <span style={{ color: 'var(--red)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>✗ {lap.cuts}c</span>
          : lap.isPB
          ? <span style={{ color: 'var(--green)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>PB</span>
          : null}
      </td>
    </tr>
  );
}

export default function LapFeed({ filterDriver }: { filterDriver?: string | null }) {
  const { recentLaps } = useLiveStore();
  const topRef = useRef<HTMLDivElement>(null);
  const now = Date.now();

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [recentLaps.length]);

  const laps = filterDriver ? recentLaps.filter(l => l.driverName === filterDriver) : recentLaps;

  if (laps.length === 0) {
    return (
      <div style={{ padding: '50px 16px', textAlign: 'center', color: '#1e1e1e', fontFamily: 'var(--font-display)', letterSpacing: '0.15em', fontSize: 12 }}>
        NO LAPS YET
      </div>
    );
  }

  return (
    <div style={{ overflowY: 'auto', maxHeight: 520 }}>
      <div ref={topRef} />
      <table>
        <thead>
          <tr>
            <th>#</th><th>Driver</th><th>Time</th><th>S1</th><th>S2</th><th>Car</th><th></th>
          </tr>
        </thead>
        <tbody>
          {laps.slice(0, 40).map(lap => (
            <LapRow key={lap.id} lap={lap} isNew={now - lap.timestamp < 2000} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
