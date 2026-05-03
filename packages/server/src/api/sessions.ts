import { Router } from 'express';
import { getDb } from '../db/database';
import { getSessions, getSessionById, getLapsBySession } from '../db/queries';

export const sessionsRouter = Router();

sessionsRouter.get('/', (req, res) => {
  const db = getDb();
  const limit  = Math.min(parseInt(String(req.query.limit  ?? 20), 10), 100);
  const offset = parseInt(String(req.query.offset ?? 0), 10);
  const track  = req.query.track  ? String(req.query.track)  : undefined;
  const server = req.query.server ? String(req.query.server) : undefined;
  const type   = req.query.type   ? String(req.query.type)   : undefined;

  const result = getSessions(db, { limit, offset, track, serverName: server, sessionType: type });
  res.json(result);
});

sessionsRouter.get('/active', (_req, res) => {
  // The active session is the most recent one without an ended_at
  const db = getDb();
  const row = db.prepare(
    'SELECT * FROM sessions WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1'
  ).get() as Record<string, unknown> | undefined;
  res.json(row ?? null);
});

sessionsRouter.get('/:id', (req, res) => {
  const db = getDb();
  const session = getSessionById(db, parseInt(req.params.id, 10));
  if (!session) return res.status(404).json({ error: 'Not found' });
  const laps = getLapsBySession(db, session.id);
  res.json({ ...session, laps });
});
