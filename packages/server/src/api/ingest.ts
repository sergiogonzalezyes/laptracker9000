import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';
import { upsertSession, upsertDriver, insertLap, updateSessionEnd } from '../db/queries';
import { broadcaster } from '../broadcast/emitter';
import { ParsedSession } from '../parser/types';
import { Config } from '../config';

export const ingestRouter = Router();

function authMiddleware(req: Request, res: Response, next: () => void) {
  const token = req.headers['x-agent-token'];
  if (!Config.ingestToken || token !== Config.ingestToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

ingestRouter.use(authMiddleware as any);

ingestRouter.post('/session/start', (req, res) => {
  const { serverName, track, trackConfig, sessionType, startedAt } = req.body;
  if (!serverName || !track || !sessionType) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const db = getDb();
  const session: ParsedSession = {
    serverName,
    track,
    trackConfig: trackConfig ?? '',
    sessionType,
    startedAt: new Date(startedAt ?? Date.now()),
    endedAt: null,
    laps: [],
  };
  const sourceFile = `agent#${serverName}#${track}#${Date.now()}`;
  const sessionId = upsertSession(db, session, sourceFile, 'agent');
  broadcaster.broadcast({ type: 'session_start', data: { sessionId, track, serverName, sessionType } });
  res.json({ sessionId });
});

ingestRouter.post('/session/end', (req, res) => {
  const { sessionId, endedAt } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
  const db = getDb();
  updateSessionEnd(db, parseInt(String(sessionId), 10), endedAt ?? new Date().toISOString());
  broadcaster.broadcast({ type: 'session_end', data: { sessionId: parseInt(String(sessionId), 10) } });
  res.json({ ok: true });
});

ingestRouter.post('/lap', (req, res) => {
  const { driverName, track, trackConfig, sessionType, carModel, lapTimeMs,
          lapNumber, cuts, split1_ms, split2_ms, split3_ms, completedAt, sessionId: reqSessionId } = req.body;

  if (!driverName || !track || lapTimeMs === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const db = getDb();
  let sessionId: number = parseInt(String(reqSessionId), 10);

  if (!sessionId || isNaN(sessionId)) {
    // Auto-create a session if not provided
    const session: ParsedSession = {
      serverName: 'agent',
      track,
      trackConfig: trackConfig ?? '',
      sessionType: sessionType ?? 'PRACTICE',
      startedAt: new Date(),
      endedAt: null,
      laps: [],
    };
    const sourceFile = `agent#auto#${track}#${Date.now()}`;
    sessionId = upsertSession(db, session, sourceFile, 'agent');
  }

  const driverId = upsertDriver(db, driverName);
  const lapId = insertLap(db, sessionId, driverId, {
    driverName,
    carModel: carModel ?? '',
    lapTimeMs: parseInt(String(lapTimeMs), 10),
    lapNumber: parseInt(String(lapNumber ?? 0), 10),
    cuts: parseInt(String(cuts ?? 0), 10),
    valid: (cuts ?? 0) === 0 && lapTimeMs < 999_000_000,
    split1Ms: split1_ms ?? null,
    split2Ms: split2_ms ?? null,
    split3Ms: split3_ms ?? null,
    completedAt: completedAt ? new Date(completedAt) : new Date(),
  });

  broadcaster.broadcast({ type: 'lap_completed', data: {
    sessionId,
    driverName,
    lapTimeMs: parseInt(String(lapTimeMs), 10),
    lapNumber: parseInt(String(lapNumber ?? 0), 10),
    cuts: parseInt(String(cuts ?? 0), 10),
    valid: (cuts ?? 0) === 0 && lapTimeMs < 999_000_000,
    carModel: carModel ?? '',
    split1Ms: split1_ms ?? null,
    split2Ms: split2_ms ?? null,
    split3Ms: split3_ms ?? null,
  }});

  res.json({ lapId, sessionId });
});
