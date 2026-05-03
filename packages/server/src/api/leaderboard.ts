import { Router } from 'express';
import { getDb } from '../db/database';
import { getLeaderboard, getLeaderboardTracks, getDriverStats } from '../db/queries';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', (req, res) => {
  const db    = getDb();
  const track = req.query.track ? String(req.query.track) : undefined;
  const type  = req.query.type  ? String(req.query.type)  : undefined;
  res.json(getLeaderboard(db, { track, sessionType: type }));
});

leaderboardRouter.get('/tracks', (_req, res) => {
  res.json(getLeaderboardTracks(getDb()));
});

leaderboardRouter.get('/drivers', (_req, res) => {
  res.json(getDriverStats(getDb()));
});
