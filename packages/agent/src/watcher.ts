import chokidar from 'chokidar';
import { openSync, readSync, closeSync, statSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { AgentConfig } from './config';
import { AgentParser, AgentParsedLap } from './parser';
import { Poster } from './poster';

function extractTs(filename: string): number {
  const m = /(\d{6})_(\d{4,6})\.log$/.exec(filename);
  if (!m) return 0;
  const d=m[1], t=m[2].padStart(6,'0');
  return new Date(2000+parseInt(d.slice(0,2)), parseInt(d.slice(2,4))-1, parseInt(d.slice(4,6)),
    parseInt(t.slice(0,2)), parseInt(t.slice(2,4)), parseInt(t.slice(4,6))).getTime();
}

function serverName(file: string): string {
  return basename(file, '.log').replace(/_\d{6}_\d+$/, '');
}

interface TailState { path: string; offset: number; buf: string; }

function readNew(state: TailState): string[] {
  let fd: number;
  try { fd = openSync(state.path, 'r'); } catch { return []; }
  try {
    const size = statSync(state.path).size;
    if (size <= state.offset) return [];
    const chunk = Math.min(size - state.offset, 1024*256);
    const buf = Buffer.allocUnsafe(chunk);
    const n = readSync(fd, buf, 0, chunk, state.offset);
    state.offset += n;
    let text = buf.slice(0, n).toString('utf8');
    if (state.offset === n && text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const combined = state.buf + text;
    const lines = combined.split(/\r?\n/);
    state.buf = lines.pop() ?? '';
    return lines;
  } finally { closeSync(fd); }
}

export function startDedicatedWatcher(config: AgentConfig, poster: Poster): void {
  const dir = config.watchPath;
  let files: string[];
  try { files = readdirSync(dir).filter(f => f.endsWith('.log')).sort((a,b) => extractTs(a)-extractTs(b)); }
  catch (e) { console.error('[agent] Cannot read watch path:', e); return; }

  if (files.length === 0) { console.log('[agent] No log files found yet. Watching for new files...'); }

  // Find most recent log to tail
  const recent = files[files.length - 1];
  const tailPath = recent ? join(dir, recent) : null;

  let tail: TailState | null = tailPath ? {
    path: tailPath,
    offset: config.backfill ? 0 : (statSync(tailPath).size ?? 0),
    buf: '',
  } : null;

  let parser: AgentParser | null = tailPath
    ? new AgentParser(serverName(tailPath), lap => handleLap(lap as AgentParsedLap, config, poster))
    : null;

  // If backfilling, read existing tail content
  if (tail && config.backfill && parser) {
    const all = readNew(tail);
    if (all.length > 0) parser.processLines(all);
  }

  chokidar.watch(dir, { persistent: true, ignoreInitial: true, awaitWriteFinish: false, usePolling: false, depth: 0 })
    .on('add', (path: string) => {
      if (!path.endsWith('.log')) return;
      const ts = extractTs(basename(path));
      const activeTs = tail ? extractTs(basename(tail.path)) : 0;
      if (ts > activeTs) {
        console.log(`[agent] New log file: ${basename(path)}`);
        tail = { path, offset: 0, buf: '' };
        parser = new AgentParser(serverName(path), lap => handleLap(lap as AgentParsedLap, config, poster));
      }
    })
    .on('change', (path: string) => {
      if (!tail || path !== tail.path || !parser) return;
      const lines = readNew(tail);
      if (lines.length > 0) parser.processLines(lines);
    });

  console.log(`[agent] Watching dedicated server logs: ${dir}`);
  if (recent) console.log(`[agent] Active log: ${recent}`);
}

async function handleLap(lap: AgentParsedLap, config: AgentConfig, poster: Poster): Promise<void> {
  if (config.playerName !== '*' && lap.driverName !== config.playerName) return;
  const ms = lap.lapTimeMs;
  const fmt = `${Math.floor(ms/60000)}:${String(Math.floor((ms%60000)/1000)).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;
  console.log(`[lap] ${lap.driverName} | ${fmt} | ${lap.track} | ${lap.valid ? 'valid' : 'INVALID'}`);
  await poster.postLap({
    driverName:  lap.driverName,
    track:       lap.track,
    sessionType: lap.sessionType,
    carModel:    lap.carModel,
    lapTimeMs:   lap.lapTimeMs,
    lapNumber:   lap.lapNumber,
    cuts:        lap.cuts,
    split1_ms:   lap.split1Ms,
    split2_ms:   lap.split2Ms,
    completedAt: lap.completedAt.toISOString(),
  });
}
