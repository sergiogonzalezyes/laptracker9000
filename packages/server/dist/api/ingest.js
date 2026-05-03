"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingestRouter = void 0;
const express_1 = require("express");
const database_1 = require("../db/database");
const queries_1 = require("../db/queries");
const emitter_1 = require("../broadcast/emitter");
const config_1 = require("../config");
exports.ingestRouter = (0, express_1.Router)();
function authMiddleware(req, res, next) {
    const token = req.headers['x-agent-token'];
    if (!config_1.Config.ingestToken || token !== config_1.Config.ingestToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}
exports.ingestRouter.use(authMiddleware);
exports.ingestRouter.post('/session/start', (req, res) => {
    const { serverName, track, trackConfig, sessionType, startedAt } = req.body;
    if (!serverName || !track || !sessionType) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const db = (0, database_1.getDb)();
    const session = {
        serverName,
        track,
        trackConfig: trackConfig ?? '',
        sessionType,
        startedAt: new Date(startedAt ?? Date.now()),
        endedAt: null,
        laps: [],
    };
    const sourceFile = `agent#${serverName}#${track}#${Date.now()}`;
    const sessionId = (0, queries_1.upsertSession)(db, session, sourceFile, 'agent');
    emitter_1.broadcaster.broadcast({ type: 'session_start', data: { sessionId, track, serverName, sessionType } });
    res.json({ sessionId });
});
exports.ingestRouter.post('/session/end', (req, res) => {
    const { sessionId, endedAt } = req.body;
    if (!sessionId)
        return res.status(400).json({ error: 'Missing sessionId' });
    const db = (0, database_1.getDb)();
    (0, queries_1.updateSessionEnd)(db, parseInt(String(sessionId), 10), endedAt ?? new Date().toISOString());
    emitter_1.broadcaster.broadcast({ type: 'session_end', data: { sessionId: parseInt(String(sessionId), 10) } });
    res.json({ ok: true });
});
exports.ingestRouter.post('/lap', (req, res) => {
    const { driverName, track, trackConfig, sessionType, carModel, lapTimeMs, lapNumber, cuts, split1_ms, split2_ms, split3_ms, completedAt, sessionId: reqSessionId } = req.body;
    if (!driverName || !track || lapTimeMs === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const db = (0, database_1.getDb)();
    let sessionId = parseInt(String(reqSessionId), 10);
    if (!sessionId || isNaN(sessionId)) {
        // Auto-create a session if not provided
        const session = {
            serverName: 'agent',
            track,
            trackConfig: trackConfig ?? '',
            sessionType: sessionType ?? 'PRACTICE',
            startedAt: new Date(),
            endedAt: null,
            laps: [],
        };
        const sourceFile = `agent#auto#${track}#${Date.now()}`;
        sessionId = (0, queries_1.upsertSession)(db, session, sourceFile, 'agent');
    }
    const driverId = (0, queries_1.upsertDriver)(db, driverName);
    const lapId = (0, queries_1.insertLap)(db, sessionId, driverId, {
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
    emitter_1.broadcaster.broadcast({ type: 'lap_completed', data: {
            sessionId,
            driverName,
            lapTimeMs: parseInt(String(lapTimeMs), 10),
            lapNumber: parseInt(String(lapNumber ?? 0), 10),
            cuts: parseInt(String(cuts ?? 0), 10),
            valid: (cuts ?? 0) === 0 && lapTimeMs < 999_000_000,
            carModel: carModel ?? '',
            split1Ms: split1_ms ?? null,
            split2Ms: split2_ms ?? null,
        } });
    res.json({ lapId, sessionId });
});
