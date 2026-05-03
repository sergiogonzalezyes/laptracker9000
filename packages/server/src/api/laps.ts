import { Router } from 'express';
import { getDb } from '../db/database';
import { getRecentLaps, getLapsBySession } from '../db/queries';

export const lapsRouter = Router();

lapsRouter.get('/recent', (req, res) => {
  const db    = getDb();
  const limit = Math.min(parseInt(String(req.query.limit ?? 50), 10), 200);
  res.json(getRecentLaps(db, limit));
});

lapsRouter.get('/', (req, res) => {
  const db = getDb();
  if (req.query.sessionId) {
    const laps = getLapsBySession(db, parseInt(String(req.query.sessionId), 10));
    return res.json(laps);
  }
  res.json(getRecentLaps(db, 50));
});
