"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = require("path");
const fs_1 = require("fs");
const config_1 = require("./config");
const database_1 = require("./db/database");
const fileWatcher_1 = require("./watcher/fileWatcher");
const acPoller_1 = require("./acApi/acPoller");
const router_1 = require("./api/router");
async function main() {
    console.log('[server] Starting LapTracker9000...');
    // ── Database ──────────────────────────────────────────────────────────────
    const db = (0, database_1.initDb)(config_1.Config.dbPath);
    console.log(`[server] Database ready at ${config_1.Config.dbPath}`);
    // ── Express app ───────────────────────────────────────────────────────────
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // API routes
    app.use('/api', router_1.apiRouter);
    // Serve built frontend — __dirname is dist/, so ../public is packages/server/public
    const webDistPath = (0, path_1.join)(__dirname, '../public');
    if ((0, fs_1.existsSync)(webDistPath)) {
        app.use(express_1.default.static(webDistPath));
        app.get('*', (_req, res) => {
            res.sendFile((0, path_1.join)(webDistPath, 'index.html'));
        });
    }
    else {
        app.get('/', (_req, res) => res.json({ status: 'LapTracker9000 API running. Build the web app to serve the UI.' }));
    }
    // ── Start server ──────────────────────────────────────────────────────────
    app.listen(config_1.Config.port, () => {
        console.log(`[server] Listening on http://localhost:${config_1.Config.port}`);
    });
    // ── File watcher + backfill ───────────────────────────────────────────────
    (0, fileWatcher_1.startWatcher)(db, config_1.Config.watchPath);
    // ── AC API poller ─────────────────────────────────────────────────────────
    (0, acPoller_1.startAcPoller)(config_1.Config.acApiUrl);
    console.log(`[server] Watching: ${config_1.Config.watchPath}`);
    console.log(`[server] AC API:   ${config_1.Config.acApiUrl}`);
    console.log(`[server] Token:    ${config_1.Config.ingestToken ? config_1.Config.ingestToken.slice(0, 8) + '...' : '(NOT SET — check .env)'}`);
}
main().catch(err => {
    console.error('[server] Fatal error:', err);
    process.exit(1);
});
