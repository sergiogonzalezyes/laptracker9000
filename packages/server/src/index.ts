import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { existsSync } from 'fs';
import { Config } from './config';
import { initDb } from './db/database';
import { startWatcher } from './watcher/fileWatcher';
import { startAcPoller } from './acApi/acPoller';
import { apiRouter } from './api/router';

async function main() {
  console.log('[server] Starting LapTracker9000...');

  // ── Database ──────────────────────────────────────────────────────────────
  const db = initDb(Config.dbPath);
  console.log(`[server] Database ready at ${Config.dbPath}`);

  // ── Express app ───────────────────────────────────────────────────────────
  const app = express();

  app.use(cors());
  app.use(express.json());

  // API routes
  app.use('/api', apiRouter);

  // Serve built frontend — __dirname is dist/, so ../public is packages/server/public
  const webDistPath = join(__dirname, '../public');
  if (existsSync(webDistPath)) {
    app.use(express.static(webDistPath));
    app.get('*', (_req, res) => {
      res.sendFile(join(webDistPath, 'index.html'));
    });
  } else {
    app.get('/', (_req, res) => res.json({ status: 'LapTracker9000 API running. Build the web app to serve the UI.' }));
  }

  // ── Start server ──────────────────────────────────────────────────────────
  app.listen(Config.port, () => {
    console.log(`[server] Listening on http://localhost:${Config.port}`);
  });

  // ── File watcher + backfill ───────────────────────────────────────────────
  startWatcher(db, Config.watchPath);

  // ── AC API poller ─────────────────────────────────────────────────────────
  startAcPoller(Config.acApiUrl);

  console.log(`[server] Watching: ${Config.watchPath}`);
  console.log(`[server] AC API:   ${Config.acApiUrl}`);
  console.log(`[server] Token:    ${Config.ingestToken ? Config.ingestToken.slice(0, 8) + '...' : '(NOT SET — check .env)'}`);
}

main().catch(err => {
  console.error('[server] Fatal error:', err);
  process.exit(1);
});
