const { app, BrowserWindow, ipcMain, Tray, Menu, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const chokidar = require('chokidar');
const os = require('os');

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

const DEFAULT_OUT_PATH = path.join(os.homedir(), 'Documents', 'Assetto Corsa', 'out');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return {
      apiUrl: 'http://localhost:3001',
      apiToken: '647e70982028cabd75bc45635da5cb9f3b357078cfbcd6d3',
      playerName: '',
      outPath: DEFAULT_OUT_PATH,
    };
  }
}

function saveConfig(cfg) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

// ── State ─────────────────────────────────────────────────────────────────────

let config = loadConfig();
let mainWindow = null;
let tray = null;
let watcher = null;
let lastHash = null;

// ── Window ────────────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 560,
    resizable: false,
    icon: path.join(__dirname, 'favicon.ico'),
    title: 'LapTracker9000 Agent',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.hide();
  });
}

// ── Tray ──────────────────────────────────────────────────────────────────────

function createTray() {
  tray = new Tray(path.join(__dirname, 'favicon.ico'));
  tray.setToolTip('LapTracker9000 Agent');

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => { watcher?.close(); app.exit(0); } },
  ]));
}

// ── File watcher + parser ─────────────────────────────────────────────────────

function startWatcher() {
  if (watcher) { watcher.close(); watcher = null; }

  const raceOutPath = path.join(config.outPath, 'race_out.json');

  if (!fs.existsSync(config.outPath)) {
    sendToRenderer('log', `⚠ Path not found: ${config.outPath}`);
    sendToRenderer('status', 'error');
    return;
  }

  sendToRenderer('log', `Watching: ${raceOutPath}`);
  sendToRenderer('status', 'watching');

  watcher = chokidar.watch(raceOutPath, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
  });

  watcher.on('change', () => handleRaceOut(raceOutPath));
  watcher.on('error', (err) => sendToRenderer('log', `Watcher error: ${err.message}`));
}

async function handleRaceOut(filePath) {
  let data;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash('sha1').update(raw).digest('hex');
    if (hash === lastHash) return;
    lastHash = hash;
    data = JSON.parse(raw);
  } catch (err) {
    sendToRenderer('log', `Failed to read race_out.json: ${err.message}`);
    return;
  }

  const track = data.track ?? 'unknown';
  const player = data.players?.[0];
  if (!player) { sendToRenderer('log', 'No player data in race_out.json'); return; }

  const driverName = config.playerName?.trim() || player.name || 'Player';
  const carModel = player.car ?? '';
  const session = data.sessions?.[0];

  if (!session) { sendToRenderer('log', 'No session data in race_out.json'); return; }

  const laps = session.laps ?? [];
  const validLaps = laps.filter(l => (l.time ?? l.lapTime ?? 0) < 999_000_000 && (l.time ?? l.lapTime ?? 0) > 0);

  if (validLaps.length === 0) {
    sendToRenderer('log', `Session ended — no valid laps (${track})`);
    return;
  }

  sendToRenderer('log', `Session ended: ${validLaps.length} lap(s) on ${track}`);

  let posted = 0;
  for (let i = 0; i < validLaps.length; i++) {
    const lap = validLaps[i];
    const lapTimeMs = lap.time ?? lap.lapTime ?? 0;
    const cuts = lap.cuts ?? 0;
    const sectors = lap.sectors ?? [];

    const payload = {
      driverName,
      track,
      sessionType: session.name?.toUpperCase() ?? 'PRACTICE',
      carModel,
      lapTimeMs,
      lapNumber: (lap.lap ?? i) + 1,
      cuts,
      split1_ms: sectors[0] ?? null,
      split2_ms: sectors[1] ?? null,
      split3_ms: sectors[2] ?? null,
      completedAt: new Date().toISOString(),
    };

    const ok = await postLap(payload);
    if (ok) posted++;
  }

  const best = Math.min(...validLaps.map(l => l.time ?? l.lapTime ?? Infinity));
  const fmt = formatMs(best);
  sendToRenderer('log', `✓ Posted ${posted}/${validLaps.length} laps — best: ${fmt}`);
  sendToRenderer('last-session', { track, sessionType: session.name ?? 'Practice', driverName, carModel, best: fmt, count: validLaps.length });
}

async function postLap(payload) {
  try {
    const res = await fetch(`${config.apiUrl}/api/ingest/lap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-token': config.apiToken,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      sendToRenderer('log', `✗ POST failed ${res.status}: ${txt.slice(0, 80)}`);
      return false;
    }
    return true;
  } catch (err) {
    sendToRenderer('log', `✗ POST error: ${err.message}`);
    return false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMs(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
  const ms3 = (ms % 1000).toString().padStart(3, '0');
  return `${m}:${s}.${ms3}`;
}

function sendToRenderer(channel, data) {
  if (mainWindow?.webContents) {
    mainWindow.webContents.send(channel, data);
  }
}

// ── IPC ───────────────────────────────────────────────────────────────────────

ipcMain.handle('get-config', () => config);

ipcMain.handle('save-config', (_e, newConfig) => {
  config = { ...config, ...newConfig };
  saveConfig(config);
  lastHash = null; // reset so next session posts fresh
  startWatcher();
  return { ok: true };
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('test-connection', async () => {
  try {
    const res = await fetch(`${config.apiUrl}/api/leaderboard/tracks`, {
      signal: AbortSignal.timeout(4000),
    });
    return res.ok ? { ok: true } : { ok: false, error: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow();
  createTray();
  startWatcher();
});

app.on('window-all-closed', (e) => e.preventDefault());
