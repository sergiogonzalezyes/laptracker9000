import { Router } from 'express';
import { sessionsRouter } from './sessions';
import { lapsRouter } from './laps';
import { leaderboardRouter } from './leaderboard';
import { liveRouter } from './live';
import { ingestRouter } from './ingest';
import { driversRouter } from './drivers';
import { statsRouter } from './stats';

export const apiRouter = Router();

apiRouter.use('/sessions',    sessionsRouter);
apiRouter.use('/laps',        lapsRouter);
apiRouter.use('/leaderboard', leaderboardRouter);
apiRouter.use('/live',        liveRouter);
apiRouter.use('/ingest',      ingestRouter);
apiRouter.use('/drivers',     driversRouter);
apiRouter.use('/stats',       statsRouter);
