import { useEffect } from 'react';
import { useSSE } from '../hooks/useSSE';
import { useLiveStore } from '../store/liveStore';
import { api } from '../api/client';
import NowRacing from '../components/live/NowRacing';
import LapFeed from '../components/live/LapFeed';

export default function LivePage() {
  const store = useLiveStore();

  // Load recent laps from history on mount
  useEffect(() => {
    api.recentLaps(30).then(store.initFromHistory);
    api.activeSession().then(s => s && store.setCurrentSession(s));
  }, []);

  useSSE('/api/live', {
    session_start: data => { store.onSessionStart(data as Parameters<typeof store.onSessionStart>[0]); store.setConnected(true); },
    session_end:   data => store.onSessionEnd(data as Parameters<typeof store.onSessionEnd>[0]),
    lap_completed: data => store.onLapCompleted(data as Parameters<typeof store.onLapCompleted>[0]),
    driver_joined: data => store.onDriverJoined(data as Parameters<typeof store.onDriverJoined>[0]),
    driver_left:   data => store.onDriverLeft(data as Parameters<typeof store.onDriverLeft>[0]),
    ac_status:     data => store.onAcStatus(data as Parameters<typeof store.onAcStatus>[0]),
    ping:          ()   => store.setConnected(true),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Now Racing */}
      <section>
        <div className="section-label">Now Racing</div>
        <NowRacing />
      </section>

      {/* Lap Feed */}
      <section>
        <div className="section-label">Recent Laps</div>
        <div className="card">
          <LapFeed />
        </div>
      </section>
    </div>
  );
}
