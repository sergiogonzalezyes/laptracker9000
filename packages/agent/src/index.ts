import { existsSync, readdirSync } from 'fs';
import { loadConfig } from './config';
import { Poster } from './poster';
import { startDedicatedWatcher } from './watcher';
import { startAcClientWatcher } from './acClientWatcher';

console.log('');
console.log('  LapTracker9000 Agent');
console.log('  ─────────────────────');
console.log('');

const config = loadConfig();
const poster = new Poster(config);

console.log(`[agent] API:    ${config.apiUrl}`);
console.log(`[agent] Player: ${config.playerName === '*' ? 'all drivers' : config.playerName}`);
console.log(`[agent] Mode:   ${config.mode}`);
console.log('');

function isDedicatedServerDir(path: string): boolean {
  if (!path || !existsSync(path)) return false;
  try {
    const files = readdirSync(path);
    return files.some(f => /^.+_\d{6}_\d+\.log$/.test(f));
  } catch { return false; }
}

function isAcClientDir(path: string): boolean {
  return !!path && existsSync(path);
}

const mode = config.mode;

if (mode === 'dedicated' || (mode === 'auto' && isDedicatedServerDir(config.watchPath))) {
  startDedicatedWatcher(config, poster);
}

if (mode === 'client' || (mode === 'auto' && isAcClientDir(config.acClientLogPath))) {
  startAcClientWatcher(config, poster);
}

if (mode === 'auto' && !isDedicatedServerDir(config.watchPath) && !isAcClientDir(config.acClientLogPath)) {
  console.error('[agent] Auto-detect: no valid watch paths found. Check your config.json.');
  console.error(`  watchPath:       ${config.watchPath || '(not set)'}`);
  console.error(`  acClientLogPath: ${config.acClientLogPath || '(not set)'}`);
  process.exit(1);
}

// Keep alive
process.on('SIGINT', () => { console.log('\n[agent] Shutting down.'); process.exit(0); });
