import { Router, Request, Response } from 'express';
import { broadcaster, LiveEvent } from '../broadcast/emitter';

export const liveRouter = Router();

liveRouter.get('/', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // for nginx proxies
  res.flushHeaders();

  const send = (event: LiveEvent) => {
    const name = event.type;
    const data = event.type === 'ping' ? '{}' : JSON.stringify((event as { data: unknown }).data);
    res.write(`event: ${name}\ndata: ${data}\n\n`);
  };

  // Send ping immediately so client knows it's connected
  send({ type: 'ping' });

  broadcaster.on('live', send);

  // Keep-alive ping every 15s
  const pingTimer = setInterval(() => {
    try { send({ type: 'ping' }); } catch { clearInterval(pingTimer); }
  }, 15_000);

  req.on('close', () => {
    broadcaster.off('live', send);
    clearInterval(pingTimer);
  });
});
