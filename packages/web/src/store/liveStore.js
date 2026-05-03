import { create } from 'zustand';
export const useLiveStore = create((set, get) => ({
    currentSession: null,
    drivers: new Map(),
    recentLaps: [],
    acStatus: null,
    isConnected: false,
    nextLapId: 0,
    setCurrentSession: s => set({ currentSession: s }),
    onSessionStart: data => set(state => ({
        currentSession: {
            id: data.sessionId,
            server_name: data.serverName,
            track: data.track,
            track_config: '',
            session_type: data.sessionType,
            started_at: new Date().toISOString(),
            ended_at: null,
            source_file: '',
            source_type: 'live',
        },
        drivers: new Map(),
    })),
    onSessionEnd: () => set(state => ({
        currentSession: state.currentSession
            ? { ...state.currentSession, ended_at: new Date().toISOString() }
            : null,
    })),
    onLapCompleted: data => set(state => {
        const drivers = new Map(state.drivers);
        const driver = drivers.get(data.driverName) ?? { name: data.driverName, carModel: data.carModel, bestLapMs: Infinity, lapCount: 0, lastLapMs: 0 };
        const isPB = data.valid && data.lapTimeMs < driver.bestLapMs;
        const sessionBest = data.valid && state.recentLaps.filter(l => l.sessionId === data.sessionId && l.valid).every(l => data.lapTimeMs <= l.lapTimeMs);
        drivers.set(data.driverName, {
            ...driver,
            bestLapMs: isPB ? data.lapTimeMs : driver.bestLapMs,
            lapCount: driver.lapCount + 1,
            lastLapMs: data.lapTimeMs,
        });
        const lap = {
            id: state.nextLapId,
            sessionId: data.sessionId,
            driverName: data.driverName,
            lapTimeMs: data.lapTimeMs,
            lapNumber: data.lapNumber,
            cuts: data.cuts,
            valid: data.valid,
            carModel: data.carModel,
            split1Ms: data.split1Ms,
            split2Ms: data.split2Ms,
            split3Ms: data.split3Ms ?? null,
            isPB,
            isSessionBest: sessionBest,
            timestamp: Date.now(),
        };
        return {
            drivers,
            nextLapId: state.nextLapId + 1,
            recentLaps: [lap, ...state.recentLaps].slice(0, 100),
        };
    }),
    onDriverJoined: data => set(state => {
        const drivers = new Map(state.drivers);
        const existing = drivers.get(data.driverName);
        drivers.set(data.driverName, { name: data.driverName, carModel: data.carModel, bestLapMs: existing?.bestLapMs ?? Infinity, lapCount: existing?.lapCount ?? 0, lastLapMs: existing?.lastLapMs ?? 0 });
        return { drivers };
    }),
    onDriverLeft: data => set(state => {
        const drivers = new Map(state.drivers);
        drivers.delete(data.driverName);
        return { drivers };
    }),
    onAcStatus: status => set({ acStatus: status }),
    setConnected: v => set({ isConnected: v }),
    initFromHistory: laps => set(state => {
        const recentLaps = laps.map((l, i) => ({
            id: i,
            sessionId: l.session_id,
            driverName: l.driver_name,
            lapTimeMs: l.lap_time_ms,
            lapNumber: l.lap_number,
            cuts: l.cuts,
            valid: l.valid === 1,
            carModel: l.car_model,
            split1Ms: l.split1_ms,
            split2Ms: l.split2_ms,
            split3Ms: l.split3_ms ?? null,
            isPB: false,
            isSessionBest: false,
            timestamp: new Date(l.completed_at).getTime(),
        }));
        return { recentLaps, nextLapId: laps.length };
    }),
}));
