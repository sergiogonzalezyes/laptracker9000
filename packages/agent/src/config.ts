import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

export interface AgentConfig {
  apiUrl: string;
  apiToken: string;
  mode: 'auto' | 'dedicated' | 'client';
  watchPath: string;
  acClientLogPath: string;
  playerName: string;  // '*' for all drivers
  backfill: boolean;
}

export function loadConfig(): AgentConfig {
  // Look for config.json next to the executable (or cwd in dev mode)
  const locations = [
    join(dirname(process.execPath), 'config.json'),
    join(process.cwd(), 'config.json'),
    join(dirname(process.argv[1] ?? ''), 'config.json'),
  ];

  for (const loc of locations) {
    if (existsSync(loc)) {
      try {
        const raw = readFileSync(loc, 'utf8');
        const cfg = JSON.parse(raw) as Partial<AgentConfig>;
        return {
          apiUrl:         cfg.apiUrl         ?? 'http://localhost:3001',
          apiToken:       cfg.apiToken        ?? '',
          mode:           cfg.mode            ?? 'auto',
          watchPath:      cfg.watchPath       ?? '',
          acClientLogPath: cfg.acClientLogPath ?? '',
          playerName:     cfg.playerName      ?? '*',
          backfill:       cfg.backfill        ?? false,
        };
      } catch (e) {
        console.error(`[agent] Failed to parse config at ${loc}:`, e);
      }
    }
  }

  console.error('[agent] No config.json found. Copy config.json.example to config.json and edit it.');
  process.exit(1);
}
