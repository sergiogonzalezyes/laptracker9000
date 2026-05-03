"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAcPoller = startAcPoller;
exports.stopAcPoller = stopAcPoller;
const emitter_1 = require("../broadcast/emitter");
const POLL_INTERVAL_MS = 3000;
let poller = null;
let lastClientCount = -1;
function startAcPoller(acApiUrl) {
    poller = setInterval(async () => {
        try {
            const res = await fetch(`${acApiUrl}/JSON`, { signal: AbortSignal.timeout(2000) });
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const clients = data.Cars?.filter(c => c.Driver?.Name).length ?? 0;
            const track = data.TrackName ?? '';
            const sessionType = data.SessionType ?? '';
            const name = data.Name ?? '';
            // Only broadcast if something changed
            if (clients !== lastClientCount) {
                lastClientCount = clients;
                emitter_1.broadcaster.broadcast({ type: 'ac_status', data: { clients, track, sessionType, name } });
            }
        }
        catch {
            // AC server offline — emit zero clients if we had some before
            if (lastClientCount !== 0) {
                lastClientCount = 0;
                emitter_1.broadcaster.broadcast({ type: 'ac_status', data: { clients: 0, track: '', sessionType: '', name: '' } });
            }
        }
    }, POLL_INTERVAL_MS);
}
function stopAcPoller() {
    if (poller) {
        clearInterval(poller);
        poller = null;
    }
}
