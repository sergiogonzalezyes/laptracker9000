"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsRouter = void 0;
const express_1 = require("express");
const database_1 = require("../db/database");
const queries_1 = require("../db/queries");
exports.sessionsRouter = (0, express_1.Router)();
exports.sessionsRouter.get('/', (req, res) => {
    const db = (0, database_1.getDb)();
    const limit = Math.min(parseInt(String(req.query.limit ?? 20), 10), 100);
    const offset = parseInt(String(req.query.offset ?? 0), 10);
    const track = req.query.track ? String(req.query.track) : undefined;
    const server = req.query.server ? String(req.query.server) : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;
    const result = (0, queries_1.getSessions)(db, { limit, offset, track, serverName: server, sessionType: type });
    res.json(result);
});
exports.sessionsRouter.get('/active', (_req, res) => {
    // The active session is the most recent one without an ended_at
    const db = (0, database_1.getDb)();
    const row = db.prepare('SELECT * FROM sessions WHERE ended_at IS NULL ORDER BY started_at DESC LIMIT 1').get();
    res.json(row ?? null);
});
exports.sessionsRouter.get('/:id', (req, res) => {
    const db = (0, database_1.getDb)();
    const session = (0, queries_1.getSessionById)(db, parseInt(req.params.id, 10));
    if (!session)
        return res.status(404).json({ error: 'Not found' });
    const laps = (0, queries_1.getLapsBySession)(db, session.id);
    res.json({ ...session, laps });
});
