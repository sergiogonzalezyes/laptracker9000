import { EventEmitter } from 'events';

export type LiveEvent =
  | { type: 'session_start'; data: { sessionId: number; track: string; serverName: string; sessionType: string } }
  | { type: 'lap_completed'; data: { sessionId: number; driverName: string; lapTimeMs: number; lapNumber: number; cuts: number; valid: boolean; carModel: string; split1Ms: number | null; split2Ms: number | null; split3Ms: number | null } }
  | { type: 'driver_joined'; data: { driverName: string; carModel: string; carSlot: number } }
  | { type: 'driver_left'; data: { driverName: string } }
  | { type: 'session_end'; data: { sessionId: number } }
  | { type: 'ac_status'; data: AcStatus }
  | { type: 'ping' };

export interface AcStatus {
  clients: number;
  track: string;
  sessionType: string;
  name: string;
}

class Broadcaster extends EventEmitter {
  emit(event: 'live', payload: LiveEvent): boolean {
    return super.emit('live', payload);
  }
  on(event: 'live', listener: (payload: LiveEvent) => void): this {
    return super.on('live', listener);
  }

  broadcast(payload: LiveEvent): void {
    this.emit('live', payload);
  }
}

export const broadcaster = new Broadcaster();
broadcaster.setMaxListeners(200); // support many SSE clients
