import { useEffect, useRef } from 'react';
import { useLiveStore, LiveLap } from '../../store/liveStore';
import { formatLapTime, trackDisplayName } from '../../api/client';

function lapClass(lap: LiveLap): string {
  if (!lap.valid) return 'lap-invalid';
  if (lap.isPB) return 'lap-pb';
  if (lap.isSessionBest) return 'lap-session';
  return '';
}

function LapRow({ lap }: { lap: LiveLap }) {
  const cls = lapClass(lap);
  const isNew = Date.now() - lap.timestamp < 2000;

  return (
    <tr className={isNew && lap.isPB ? 'lap-pulse' : ''}>
      <td style={{ width: 28, color: 'var(--text-muted)', fontSize: 11 }}>#{lap.lapNumber || '—'}</td>
      <td style={{ fontWeight: 500 }}>{lap.driverName}</td>
      <td className={`mono ${cls}`} style={{ fontSize: 15, fontWeight: 700 }}>
        {formatLapTime(lap.lapTimeMs)}
      </td>
      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {lap.split1Ms ? formatLapTime(lap.split1Ms) : '—'}
      </td>
      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {lap.split2Ms ? formatLapTime(lap.split2Ms) : '—'}
      </td>
      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {lap.carModel.replace(/_/g, ' ')}
      </td>
      <td style={{ fontSize: 11 }}>
        {!lap.valid ? <span style={{ color: 'var(--red)', fontSize: 11 }}>✗ {lap.cuts}c</span>
          : lap.isPB ? <span style={{ color: 'var(--green)', fontSize: 11 }}>PB</span>
          : null}
      </td>
    </tr>
  );
}

export default function LapFeed() {
  const { recentLaps } = useLiveStore();
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [recentLaps.length]);

  if (recentLaps.length === 0) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No laps yet
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
          {recentLaps.slice(0, 40).map(lap => <LapRow key={lap.id} lap={lap} />)}
        </tbody>
      </table>
    </div>
  );
}
