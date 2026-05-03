import { config } from 'dotenv';
import { resolve } from 'path';

// __dirname is packages/server/src (tsx) or packages/server/dist (compiled)
// Three levels up reaches the monorepo root: src/ -> server/ -> packages/ -> root
config({ path: resolve(__dirname, '../../../.env') });

export const Config = {
  port:       parseInt(process.env.PORT ?? '3001', 10),
  watchPath:  process.env.WATCH_PATH ?? 'F:\\Program Files (x86)\\Steam\\steamapps\\common\\assettocorsa\\server\\results',
  dbPath:     process.env.DB_PATH ?? resolve(__dirname, '../data/laptracker.db'),
  acApiUrl:   process.env.AC_API_URL ?? 'http://localhost:8081',
  ingestToken: process.env.INGEST_TOKEN ?? '',
} as const;
