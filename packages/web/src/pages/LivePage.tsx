import { useEffect, useState } from 'react';
import { useLiveStore } from '../store/liveStore';
import { api } from '../api/client';
import NowRacing from '../components/live/NowRacing';
import LapFeed from '../components/live/LapFeed';

export default function LivePage() {
  const store = useLiveStore();
  const [focusedDriver, setFocusedDriver] = useState<string | null>(null);

  useEffect(() => {
    api.recentLaps(30).then(store.initFromHistory);
    api.activeSession().then(s => s && store.setCurrentSession(s));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusedDriver(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section>
        <div className="section-label">Now Racing</div>
        <NowRacing focusedDriver={focusedDriver} onFocus={setFocusedDriver} />
      </section>

      <section>
        <div className="section-label" style={{ marginBottom: 0 }}>
          Recent Laps
          {focusedDriver && (
            <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--accent-hot)', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
              — {focusedDriver}
            </span>
          )}
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <LapFeed filterDriver={focusedDriver} />
        </div>
      </section>
    </div>
  );
}
