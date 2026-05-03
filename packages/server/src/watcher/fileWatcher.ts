import chokidar from 'chokidar';
import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { DatabaseSync } from 'node:sqlite';
import { parseLogContent, createParserState, parseLines, ParserState } from '../parser/logParser';
import { importJsonFile } from '../parser/jsonImporter';
import { ingestParsedSession, isFileIngested, markFileIngested, insertLap, upsertDriver } from '../db/queries';
import { createTailState, readNewLines, readFullFile, TailState } from './tailReader';
import { broadcaster } from '../broadcast/emitter';

// Extract timestamp from filename: "Double Blinker Grih_260420_224025.log" → 2026-04-20 22:40:25
function extractFileTimestamp(filename: string): number {
  const m = /(\d{6})_(\d{4,6})\.log$/.exec(filename);
  if (!m) return 0;
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

function serverNameFromFilename(filename: string): string {
  return basename(filename, '.log').replace(/_\d{6}_\d+$/, '');
}

interface ActiveSession {
  sessionId: number;
  trackConfig: string;
}

interface WatcherState {
  activeTail: TailState | null;
  liveParserState: ParserState | null;
  activeSession: ActiveSession | null;
  activeSessionLapCount: number;
}

export function startWatcher(db: DatabaseSync, watchPath: string): void {
  const state: WatcherState = {
    activeTail: null,
    liveParserState: null,
    activeSession: null,
    activeSessionLapCount: 0,
  };

  // ── Startup: backfill all existing unprocessed files ──────────────────────

  let allFiles: string[];
  try {
    allFiles = readdirSync(watchPath);
  } catch (e) {
    console.error(`[watcher] Cannot read watch path: ${watchPath}`, e);
    return;
  }

  const logFiles = allFiles
    .filter(f => f.endsWith('.log'))
    .sort((a, b) => extractFileTimestamp(a) - extractFileTimestamp(b));

  const jsonFiles = allFiles.filter(f => f.endsWith('.json'));

  // Backfill JSON files
  for (const file of jsonFiles) {
    const fullPath = join(watchPath, file);
    if (isFileIngested(db, fullPath)) continue;
    const session = importJsonFile(fullPath);
    if (session) {
      ingestParsedSession(db, session, fullPath, 'json');
    }
    markFileIngested(db, fullPath, 0);
  }

  // Backfill log files (except the most recent, which we tail)
  for (let i = 0; i < logFiles.length - 1; i++) {
    const fullPath = join(watchPath, logFiles[i]);
    if (isFileIngested(db, fullPath)) continue;
    const { lines } = readFullFile(fullPath);
    const serverName = serverNameFromFilename(logFiles[i]);
    const result = parseLogContent(lines.join('\n'), serverName);
    for (const session of result.sessions) {
      ingestParsedSession(db, session, fullPath + `#${session.sessionType}`);
    }
    markFileIngested(db, fullPath, lines.length);
  }

  console.log(`[watcher] Backfill complete. Watching ${watchPath}`);

  // ── Set up tail on the most recent log file ───────────────────────────────

  if (logFiles.length > 0) {
    const mostRecent = join(watchPath, logFiles[logFiles.length - 1]);
    const serverName = serverNameFromFilename(logFiles[logFiles.length - 1]);
    state.activeTail = createTailState(mostRecent);
    state.liveParserState = createParserState(serverName);
  }

  // ── chokidar watcher ──────────────────────────────────────────────────────

  chokidar.watch(watchPath, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: false,
    usePolling: false,
    depth: 0,
  }).on('add', (filePath: string) => {
    const file = basename(filePath);

    if (file.endsWith('.json') && !isFileIngested(db, filePath)) {
      const session = importJsonFile(filePath);
      if (session) ingestParsedSession(db, session, filePath, 'json');
      markFileIngested(db, filePath, 0);
      return;
    }

    if (file.endsWith('.log')) {
      const ts = extractFileTimestamp(file);
      const activeName = state.activeTail ? basename(state.activeTail.filePath) : '';
      const activeTs = extractFileTimestamp(activeName);

      if (ts > activeTs) {
        // New server session started — flush old tail, start new one
        if (state.activeTail) {
          const remaining = readNewLines(state.activeTail);
          if (remaining.length > 0 && state.liveParserState) {
            parseLines(remaining, state.liveParserState);
          }
        }
        const serverName = serverNameFromFilename(file);
        state.activeTail = createTailState(filePath);
        state.liveParserState = createParserState(serverName);
        state.activeSession = null;
        state.activeSessionLapCount = 0;
        console.log(`[watcher] New active log: ${file}`);
      } else {
        // Older file — backfill it
        if (!isFileIngested(db, filePath)) {
          const { lines } = readFullFile(filePath);
          const serverName = serverNameFromFilename(file);
          const result = parseLogContent(lines.join('\n'), serverName);
          for (const session of result.sessions) {
            ingestParsedSession(db, session, filePath + `#${session.sessionType}`);
          }
          markFileIngested(db, filePath, lines.length);
        }
      }
    }
  }).on('change', (filePath: string) => {
    if (!state.activeTail || filePath !== state.activeTail.filePath) return;
    if (!state.liveParserState) return;

    const newLines = readNewLines(state.activeTail);
    if (newLines.length === 0) return;

    const prevLapCount = state.liveParserState.currentSessionLaps.length;
    const prevSessionCount = state.liveParserState.completedSessions.length;

    parseLines(newLines, state.liveParserState);

    const ps = state.liveParserState;

    // Detect new sessions starting
    if (ps.completedSessions.length > prevSessionCount) {
      for (let i = prevSessionCount; i < ps.completedSessions.length; i++) {
        const session = ps.completedSessions[i];
        const sourceFile = state.activeTail.filePath + `#${session.sessionType}#${i}`;
        const sessionId = ingestParsedSession(db, session, sourceFile);
        broadcaster.broadcast({ type: 'session_start', data: {
          sessionId,
          track: session.track,
          serverName: session.serverName,
          sessionType: session.sessionType,
        }});
        if (session.endedAt) {
          broadcaster.broadcast({ type: 'session_end', data: { sessionId }});
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
        const sessionId = ingestParsedSession(db, tempSession, sourceFile);
        state.activeSession = { sessionId, trackConfig: ps.trackConfig };
        broadcaster.broadcast({ type: 'session_start', data: {
          sessionId,
          track: ps.track,
          serverName: ps.serverName,
          sessionType: ps.sessionType,
        }});
      }

      if (state.activeSession) {
        for (let i = prevLapCount; i < newLapCount; i++) {
          const lap = ps.currentSessionLaps[i];
          const driverId = upsertDriver(db, lap.driverName);
          const lapId = insertLap(db, state.activeSession.sessionId, driverId, lap);
          broadcaster.broadcast({ type: 'lap_completed', data: {
            sessionId: state.activeSession.sessionId,
            driverName: lap.driverName,
            lapTimeMs:  lap.lapTimeMs,
            lapNumber:  lap.lapNumber,
            cuts:       lap.cuts,
            valid:      lap.valid,
            carModel:   lap.carModel,
            split1Ms:   lap.split1Ms,
            split2Ms:   lap.split2Ms,
          }});

          console.log(`[lap] ${lap.driverName} ${(lap.lapTimeMs / 1000).toFixed(3)}s on ${ps.track} (${lap.valid ? 'valid' : 'INVALID'})`);
        }
      }
    }
  }).on('error', (err: Error) => {
    console.error('[watcher] Error:', err);
  });
}
