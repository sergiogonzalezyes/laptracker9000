"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liveRouter = void 0;
const express_1 = require("express");
const emitter_1 = require("../broadcast/emitter");
exports.liveRouter = (0, express_1.Router)();
exports.liveRouter.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // for nginx proxies
    res.flushHeaders();
    const send = (event) => {
        const name = event.type;
        const data = event.type === 'ping' ? '{}' : JSON.stringify(event.data);
        res.write(`event: ${name}\ndata: ${data}\n\n`);
    };
    // Send ping immediately so client knows it's connected
    send({ type: 'ping' });
    emitter_1.broadcaster.on('live', send);
    // Keep-alive ping every 15s
    const pingTimer = setInterval(() => {
        try {
            send({ type: 'ping' });
        }
        catch {
            clearInterval(pingTimer);
        }
    }, 15_000);
    req.on('close', () => {
        emitter_1.broadcaster.off('live', send);
        clearInterval(pingTimer);
    });
});
