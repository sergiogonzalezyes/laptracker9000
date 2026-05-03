import { broadcaster } from '../broadcast/emitter';

const POLL_INTERVAL_MS = 3000;

interface AcJsonCar {
  CarId: number;
  Driver: { Name: string; Guid: string };
  Model: string;
}

interface AcJsonResponse {
  Cars: AcJsonCar[];
  TrackName?: string;
  TrackConfig?: string;
  SessionType?: string;
  Name?: string;
}

let poller: ReturnType<typeof setInterval> | null = null;
let lastClientCount = -1;

export function startAcPoller(acApiUrl: string): void {
  poller = setInterval(async () => {
    try {
      const res = await fetch(`${acApiUrl}/JSON`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as AcJsonResponse;

      const clients = data.Cars?.filter(c => c.Driver?.Name).length ?? 0;
      const track = data.TrackName ?? '';
      const sessionType = data.SessionType ?? '';
      const name = data.Name ?? '';

      // Only broadcast if something changed
      if (clients !== lastClientCount) {
        lastClientCount = clients;
        broadcaster.broadcast({ type: 'ac_status', data: { clients, track, sessionType, name } });
      }
    } catch {
      // AC server offline — emit zero clients if we had some before
      if (lastClientCount !== 0) {
        lastClientCount = 0;
        broadcaster.broadcast({ type: 'ac_status', data: { clients: 0, track: '', sessionType: '', name: '' } });
      }
    }
  }, POLL_INTERVAL_MS);
}

export function stopAcPoller(): void {
  if (poller) { clearInterval(poller); poller = null; }
}
