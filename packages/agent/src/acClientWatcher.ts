import chokidar from 'chokidar';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';
import { AgentConfig } from './config';
import { Poster } from './poster';

// AC client (single-player) writes to Documents\Assetto Corsa\logs\log.txt
// The format is different from the dedicated server logs.
// Key lap completion line format (from AC client):
//   "LAP <DRIVER> <MM:SS:mmm> <CUT_COUNT> <TRACK> <CAR>"
// OR the session results file at Documents\Assetto Corsa\out\<track>\<car>\setup.ini (no laps)

// The AC client SharedMemory API is the most reliable source, but requires
// a native addon. As a fallback, we watch the log.txt file for lap events.

const LAP_PATTERN = /Lap\s+completed\s*:\s*(.+)/i;
// AC client log format (approximate — varies by version):
// INFO: Race, DriverXYZ, Best: 1:23.456 (84234ms)
const BEST_LAP_PATTERN = /Best:\s*[\d:]+\s*\((\d+)ms\)/i;

interface TailState { offset: number; }

export function startAcClientWatcher(config: AgentConfig, poster: Poster): void {
  const logPath = join(config.acClientLogPath, 'log.txt');

  let state: TailState = { offset: 0 };
  try { state.offset = statSync(logPath).size ?? 0; } catch { /* file may not exist yet */ }

  console.log(`[agent] Watching AC client log: ${logPath}`);

  chokidar.watch(config.acClientLogPath, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: false,
    usePolling: true,  // AC client may not trigger fs events reliably
    interval: 1000,
    depth: 1,
  }).on('change', (path: string) => {
    if (!path.endsWith('log.txt') && !path.endsWith('race_out.txt')) return;

    let content: string;
    try {
      const buf = readFileSync(path);
      const newBytes = buf.slice(state.offset);
      state.offset = buf.length;
      content = newBytes.toString('utf8');
    } catch { return; }

    for (const line of content.split(/\r?\n/)) {
      const lapMatch = LAP_PATTERN.exec(line);
      if (!lapMatch) continue;

      const bestMatch = BEST_LAP_PATTERN.exec(line);
      const lapTimeMs = bestMatch ? parseInt(bestMatch[1], 10) : 0;
      if (!lapTimeMs) continue;

      const driverName = config.playerName === '*' ? 'Player' : config.playerName;
      console.log(`[lap/client] ${driverName} | ${lapTimeMs}ms | AC Client`);
      poster.postLap({
        driverName,
        track: 'unknown',
        sessionType: 'PRACTICE',
        lapTimeMs,
        completedAt: new Date().toISOString(),
      });
    }
  });
}
