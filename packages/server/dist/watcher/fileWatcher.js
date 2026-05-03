"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWatcher = startWatcher;
const chokidar_1 = __importDefault(require("chokidar"));
const fs_1 = require("fs");
const path_1 = require("path");
const logParser_1 = require("../parser/logParser");
const jsonImporter_1 = require("../parser/jsonImporter");
const queries_1 = require("../db/queries");
const tailReader_1 = require("./tailReader");
const emitter_1 = require("../broadcast/emitter");
// Extract timestamp from filename: "Double Blinker Grih_260420_224025.log" → 2026-04-20 22:40:25
function extractFileTimestamp(filename) {
    const m = /(\d{6})_(\d{4,6})\.log$/.exec(filename);
    if (!m)
        return 0;
    const date = m[1]; // YYMMDD
    const time = m[2].padStart(6, '0'); // HHMMSS
    const year = 2000 + parseInt(date.slice(0, 2), 10);
    const month = parseInt(date.slice(2, 4), 10) - 1;
    const day = parseInt(date.slice(4, 6), 10);
    const hour = parseInt(time.slice(0, 2), 10);
    const min = parseInt(time.slice(2, 4), 10);
    const sec = parseInt(time.slice(4, 6), 10);
    return new Date(year, month, day, hour, min, sec).getTime();
}
function serverNameFromFilename(filename) {
    return (0, path_1.basename)(filename, '.log').replace(/_\d{6}_\d+$/, '');
}
function startWatcher(db, watchPath) {
    const state = {
        activeTail: null,
        liveParserState: null,
        activeSession: null,
        activeSessionLapCount: 0,
    };
    // ── Startup: backfill all existing unprocessed files ──────────────────────
    let allFiles;
    try {
        allFiles = (0, fs_1.readdirSync)(watchPath);
    }
    catch (e) {
        console.error(`[watcher] Cannot read watch path: ${watchPath}`, e);
        return;
    }
    const logFiles = allFiles
        .filter(f => f.endsWith('.log'))
        .sort((a, b) => extractFileTimestamp(a) - extractFileTimestamp(b));
    const jsonFiles = allFiles.filter(f => f.endsWith('.json'));
    // Backfill JSON files
    for (const file of jsonFiles) {
        const fullPath = (0, path_1.join)(watchPath, file);
        if ((0, queries_1.isFileIngested)(db, fullPath))
            continue;
        const session = (0, jsonImporter_1.importJsonFile)(fullPath);
        if (session) {
            (0, queries_1.ingestParsedSession)(db, session, fullPath, 'json');
        }
        (0, queries_1.markFileIngested)(db, fullPath, 0);
    }
    // Backfill log files (except the most recent, which we tail)
    for (let i = 0; i < logFiles.length - 1; i++) {
        const fullPath = (0, path_1.join)(watchPath, logFiles[i]);
        if ((0, queries_1.isFileIngested)(db, fullPath))
            continue;
        const { lines } = (0, tailReader_1.readFullFile)(fullPath);
        const serverName = serverNameFromFilename(logFiles[i]);
        const result = (0, logParser_1.parseLogContent)(lines.join('\n'), serverName);
        for (const session of result.sessions) {
            (0, queries_1.ingestParsedSession)(db, session, fullPath + `#${session.sessionType}`);
        }
        (0, queries_1.markFileIngested)(db, fullPath, lines.length);
    }
    console.log(`[watcher] Backfill complete. Watching ${watchPath}`);
    // ── Set up tail on the most recent log file ───────────────────────────────
    if (logFiles.length > 0) {
        const mostRecent = (0, path_1.join)(watchPath, logFiles[logFiles.length - 1]);
        const serverName = serverNameFromFilename(logFiles[logFiles.length - 1]);
        state.activeTail = (0, tailReader_1.createTailState)(mostRecent);
        state.liveParserState = (0, logParser_1.createParserState)(serverName);
    }
    // ── chokidar watcher ──────────────────────────────────────────────────────
    chokidar_1.default.watch(watchPath, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: false,
        usePolling: false,
        depth: 0,
    }).on('add', (filePath) => {
        const file = (0, path_1.basename)(filePath);
        if (file.endsWith('.json') && !(0, queries_1.isFileIngested)(db, filePath)) {
            const session = (0, jsonImporter_1.importJsonFile)(filePath);
            if (session)
                (0, queries_1.ingestParsedSession)(db, session, filePath, 'json');
            (0, queries_1.markFileIngested)(db, filePath, 0);
            return;
        }
        if (file.endsWith('.log')) {
            const ts = extractFileTimestamp(file);
            const activeName = state.activeTail ? (0, path_1.basename)(state.activeTail.filePath) : '';
            const activeTs = extractFileTimestamp(activeName);
            if (ts > activeTs) {
                // New server session started — flush old tail, start new one
                if (state.activeTail) {
                    const remaining = (0, tailReader_1.readNewLines)(state.activeTail);
                    if (remaining.length > 0 && state.liveParserState) {
                        (0, logParser_1.parseLines)(remaining, state.liveParserState);
                    }
                }
                const serverName = serverNameFromFilename(file);
                state.activeTail = (0, tailReader_1.createTailState)(filePath);
                state.liveParserState = (0, logParser_1.createParserState)(serverName);
                state.activeSession = null;
                state.activeSessionLapCount = 0;
                console.log(`[watcher] New active log: ${file}`);
            }
            else {
                // Older file — backfill it
                if (!(0, queries_1.isFileIngested)(db, filePath)) {
                    const { lines } = (0, tailReader_1.readFullFile)(filePath);
                    const serverName = serverNameFromFilename(file);
                    const result = (0, logParser_1.parseLogContent)(lines.join('\n'), serverName);
                    for (const session of result.sessions) {
                        (0, queries_1.ingestParsedSession)(db, session, filePath + `#${session.sessionType}`);
                    }
                    (0, queries_1.markFileIngested)(db, filePath, lines.length);
                }
            }
        }
    }).on('change', (filePath) => {
        if (!state.activeTail || filePath !== state.activeTail.filePath)
            return;
        if (!state.liveParserState)
            return;
        const newLines = (0, tailReader_1.readNewLines)(state.activeTail);
        if (newLines.length === 0)
            return;
        const prevLapCount = state.liveParserState.currentSessionLaps.length;
        const prevSessionCount = state.liveParserState.completedSessions.length;
        (0, logParser_1.parseLines)(newLines, state.liveParserState);
        const ps = state.liveParserState;
        // Detect new sessions starting
        if (ps.completedSessions.length > prevSessionCount) {
            for (let i = prevSessionCount; i < ps.completedSessions.length; i++) {
                const session = ps.completedSessions[i];
                const sourceFile = state.activeTail.filePath + `#${session.sessionType}#${i}`;
                const sessionId = (0, queries_1.ingestParsedSession)(db, session, sourceFile);
                emitter_1.broadcaster.broadcast({ type: 'session_start', data: {
                        sessionId,
                        track: session.track,
                        serverName: session.serverName,
                        sessionType: session.sessionType,
                    } });
                if (session.endedAt) {
                    emitter_1.broadcaster.broadcast({ type: 'session_end', data: { sessionId } });
                }
            }
        }
        // Detect new laps in the current (open) session
        const newLapCount = ps.currentSessionLaps.length;
        if (newLapCount > prevLapCount) {
            // Ensure we have an active session record in the DB for the live session
            if (!state.activeSession && ps.track) {
                const tempSession = {
                    serverName: ps.serverName,
                    track: ps.track,
                    trackConfig: ps.trackConfig,
                    sessionType: ps.sessionType,
                    startedAt: ps.sessionStartedAt,
                    endedAt: null,
                    laps: [],
                };
                const sourceFile = state.activeTail.filePath + `#live#${ps.sessionType}`;
                const sessionId = (0, queries_1.ingestParsedSession)(db, tempSession, sourceFile);
                state.activeSession = { sessionId, trackConfig: ps.trackConfig };
                emitter_1.broadcaster.broadcast({ type: 'session_start', data: {
                        sessionId,
                        track: ps.track,
                        serverName: ps.serverName,
                        sessionType: ps.sessionType,
                    } });
            }
            if (state.activeSession) {
                for (let i = prevLapCount; i < newLapCount; i++) {
                    const lap = ps.currentSessionLaps[i];
                    const driverId = (0, queries_1.upsertDriver)(db, lap.driverName);
                    const lapId = (0, queries_1.insertLap)(db, state.activeSession.sessionId, driverId, lap);
                    emitter_1.broadcaster.broadcast({ type: 'lap_completed', data: {
                            sessionId: state.activeSession.sessionId,
                            driverName: lap.driverName,
                            lapTimeMs: lap.lapTimeMs,
                            lapNumber: lap.lapNumber,
                            cuts: lap.cuts,
                            valid: lap.valid,
                            carModel: lap.carModel,
                            split1Ms: lap.split1Ms,
                            split2Ms: lap.split2Ms,
                            split3Ms: lap.split3Ms,
                        } });
                    console.log(`[lap] ${lap.driverName} ${(lap.lapTimeMs / 1000).toFixed(3)}s on ${ps.track} (${lap.valid ? 'valid' : 'INVALID'})`);
                }
            }
        }
    }).on('error', (err) => {
        console.error('[watcher] Error:', err);
    });
}
