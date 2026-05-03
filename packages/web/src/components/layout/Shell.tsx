import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import { useSSE } from '../../hooks/useSSE';
import { useLiveStore } from '../../store/liveStore';

export default function Shell() {
  const store = useLiveStore();

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBar />
      <main style={{ flex: 1, padding: 'clamp(16px, 4vw, 32px)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}
