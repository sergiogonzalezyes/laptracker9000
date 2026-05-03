"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lapsRouter = void 0;
const express_1 = require("express");
const database_1 = require("../db/database");
const queries_1 = require("../db/queries");
exports.lapsRouter = (0, express_1.Router)();
exports.lapsRouter.get('/recent', (req, res) => {
    const db = (0, database_1.getDb)();
    const limit = Math.min(parseInt(String(req.query.limit ?? 50), 10), 200);
    res.json((0, queries_1.getRecentLaps)(db, limit));
});
exports.lapsRouter.get('/', (req, res) => {
    const db = (0, database_1.getDb)();
    if (req.query.sessionId) {
        const laps = (0, queries_1.getLapsBySession)(db, parseInt(String(req.query.sessionId), 10));
        return res.json(laps);
    }
    res.json((0, queries_1.getRecentLaps)(db, 50));
});
