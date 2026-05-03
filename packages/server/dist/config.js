"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
// __dirname is packages/server/src (tsx) or packages/server/dist (compiled)
// Three levels up reaches the monorepo root: src/ -> server/ -> packages/ -> root
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, '../../../.env') });
exports.Config = {
    port: parseInt(process.env.PORT ?? '3001', 10),
    watchPath: process.env.WATCH_PATH ?? 'F:\\Program Files (x86)\\Steam\\steamapps\\common\\assettocorsa\\server\\results',
    dbPath: process.env.DB_PATH ?? (0, path_1.resolve)(__dirname, '../data/laptracker.db'),
    acApiUrl: process.env.AC_API_URL ?? 'http://localhost:8081',
    ingestToken: process.env.INGEST_TOKEN ?? '',
};
