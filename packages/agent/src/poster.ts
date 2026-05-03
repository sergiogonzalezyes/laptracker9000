import { AgentConfig } from './config';

interface LapPayload {
  driverName: string;
  track: string;
  trackConfig?: string;
  sessionType?: string;
  carModel?: string;
  lapTimeMs: number;
  lapNumber?: number;
  cuts?: number;
  split1_ms?: number | null;
  split2_ms?: number | null;
  split3_ms?: number | null;
  completedAt?: string;
  sessionId?: number;
}

interface SessionPayload {
  serverName: string;
  track: string;
  trackConfig?: string;
  sessionType: string;
  startedAt?: string;
}

export class Poster {
  constructor(private config: AgentConfig) {}

  private async post(path: string, body: unknown): Promise<unknown> {
    const res = await fetch(`${this.config.apiUrl}/api/ingest${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-token': this.config.apiToken,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`POST ${path} → ${res.status}: ${text}`);
    }
    return res.json();
  }

  async postLap(lap: LapPayload): Promise<{ lapId: number; sessionId: number } | null> {
    try {
      const result = await this.post('/lap', lap);
      return result as { lapId: number; sessionId: number };
    } catch (e) {
      console.error('[agent] Failed to post lap:', (e as Error).message);
      return null;
    }
  }

  async startSession(session: SessionPayload): Promise<number | null> {
    try {
      const result = await this.post('/session/start', session) as { sessionId: number };
      return result.sessionId;
    } catch (e) {
      console.error('[agent] Failed to start session:', (e as Error).message);
      return null;
    }
  }

  async endSession(sessionId: number): Promise<void> {
    try {
      await this.post('/session/end', { sessionId, endedAt: new Date().toISOString() });
    } catch (e) {
      console.error('[agent] Failed to end session:', (e as Error).message);
    }
  }
}
