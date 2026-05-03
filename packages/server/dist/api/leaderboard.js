"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardRouter = void 0;
const express_1 = require("express");
const database_1 = require("../db/database");
const queries_1 = require("../db/queries");
exports.leaderboardRouter = (0, express_1.Router)();
exports.leaderboardRouter.get('/', (req, res) => {
    const db = (0, database_1.getDb)();
    const track = req.query.track ? String(req.query.track) : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;
    res.json((0, queries_1.getLeaderboard)(db, { track, sessionType: type }));
});
exports.leaderboardRouter.get('/tracks', (_req, res) => {
    res.json((0, queries_1.getLeaderboardTracks)((0, database_1.getDb)()));
});
exports.leaderboardRouter.get('/drivers', (_req, res) => {
    res.json((0, queries_1.getDriverStats)((0, database_1.getDb)()));
});
