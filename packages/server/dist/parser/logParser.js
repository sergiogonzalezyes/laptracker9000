"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLine = processLine;
exports.parseLines = parseLines;
exports.parseLogContent = parseLogContent;
exports.createParserState = createParserState;
// "1:10:235" → 70235ms  |  "16666:39:999" → 999999999ms (AC placeholder)
function parseACTime(s) {
    const parts = s.split(':');
    if (parts.length !== 3)
        return 999999999;
    const [m, sec, ms] = parts.map(Number);
    return m * 60_000 + sec * 1_000 + ms;
}
const INVALID_TIME_MS = 999_000_000;
function newState(serverName) {
    const now = new Date();
    return {
        serverName,
        track: '',
        trackConfig: '',
        sessionType: 'PRACTICE',
        sessionStartedAt: now,
        sessionEnded: false,
        lastTimestamp: now,
        inPickup: false,
        afterVersion: false,
        pendingDriverName: null,
        pendingDriverGuid: null,
        pendingDriverSlot: null,
        slots: new Map(),
        pendingSplits: new Map(),
        activeLapBlock: null,
        inLapBlock: false,
        currentSessionLaps: [],
        completedSessions: [],
    };
}
function finalizeSession(state, endedAt = null) {
    if (state.track && state.currentSessionLaps.length > 0) {
        state.completedSessions.push({
            serverName: state.serverName,
            track: state.track,
            trackConfig: state.trackConfig,
            sessionType: state.sessionType,
            startedAt: state.sessionStartedAt,
            endedAt,
            laps: [...state.currentSessionLaps],
        });
    }
    state.currentSessionLaps = [];
    state.pendingSplits = new Map();
    state.activeLapBlock = null;
    state.inLapBlock = false;
    state.slots = new Map();
}
const RE_TIMESTAMP = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/;
const RE_TRACK = /^TRACK=(.+)/;
const RE_SESSION_TYPE = /^TYPE=(\w+)/;
// CAR: 0 model_name (0) [ []] ...
const RE_CAR_LIST = /^CAR:\s+(\d+)\s+(\S+)\s+\(\d+\)/;
// Dispatching TCP message to model (slot) [name []]  — most reliable slot+car+name mapping
const RE_DISPATCH = /^Dispatching TCP message to (\S+) \((\d+)\) \[(.+?) \[\]\]/;
// Looking for available slot by name for GUID 76561197... car_model
const RE_GUID_LOOKUP = /^Looking for available slot by name for GUID (\S+)/;
// Slot found at index N
const RE_SLOT_FOUND = /^Slot found at index (\d+)/;
const RE_SPLIT = /^Car\.onSplitCompleted\s+(\d+)\s+(\d+)\s+(\d+)/;
const RE_LAP = /^LAP\s+(.+?)\s+(\d+:\d+:\d+)\s*$/;
const RE_CUTS = /^Result\.OnLapCompleted\.\s*Cuts:\s*(\d+)/;
const RE_LEADERBOARD = /^\d+\)\s+(.+?)\s+BEST:.*?Laps:(\d+)/;
const RE_DISCONNECTED = /^Clean exit, driver disconnected:\s+(.+?)\s+\[/;
function processLine(line, state) {
    if (line.charCodeAt(0) === 0xFEFF)
        line = line.slice(1);
    const trimmed = line.trim();
    // Track timestamps for lap completion times
    const tsMatch = RE_TIMESTAMP.exec(trimmed);
    if (tsMatch) {
        const ts = new Date(tsMatch[1]);
        if (!isNaN(ts.getTime())) {
            state.lastTimestamp = ts;
        }
        return;
    }
    if (!trimmed)
        return;
    // --- Session metadata ---
    if (RE_TRACK.test(trimmed)) {
        state.track = trimmed.replace('TRACK=', '').trim();
        return;
    }
    if (RE_SESSION_TYPE.test(trimmed)) {
        state.sessionType = RE_SESSION_TYPE.exec(trimmed)[1];
        state.sessionStartedAt = state.lastTimestamp;
        return;
    }
    // Car list at startup: map slot → model
    const carListMatch = RE_CAR_LIST.exec(trimmed);
    if (carListMatch) {
        const slot = parseInt(carListMatch[1], 10);
        const model = carListMatch[2];
        if (!state.slots.has(slot)) {
            state.slots.set(slot, { name: '', carModel: model, guid: '' });
        }
        return;
    }
    // --- Driver connection handshake ---
    if (trimmed === 'NEW PICKUP CONNECTION' || trimmed.startsWith('NEW PICKUP CONNECTION from')) {
        state.inPickup = true;
        state.afterVersion = false;
        state.pendingDriverName = null;
        state.pendingDriverGuid = null;
        state.pendingDriverSlot = null;
        return;
    }
    if (trimmed.startsWith('VERSION') && state.inPickup) {
        state.afterVersion = true;
        return;
    }
    // The line immediately after VERSION is the driver name (bare string)
    if (state.afterVersion && state.inPickup) {
        state.pendingDriverName = trimmed;
        state.afterVersion = false;
        return;
    }
    const guidMatch = RE_GUID_LOOKUP.exec(trimmed);
    if (guidMatch) {
        state.pendingDriverGuid = guidMatch[1];
        return;
    }
    const slotMatch = RE_SLOT_FOUND.exec(trimmed);
    if (slotMatch) {
        state.pendingDriverSlot = parseInt(slotMatch[1], 10);
        return;
    }
    // Finalize connection when we get the dispatch line — most reliable
    const dispatchMatch = RE_DISPATCH.exec(trimmed);
    if (dispatchMatch) {
        const carModel = dispatchMatch[1];
        const slot = parseInt(dispatchMatch[2], 10);
        const name = dispatchMatch[3].trim();
        if (name) {
            state.slots.set(slot, {
                name,
                carModel,
                guid: (state.pendingDriverSlot === slot ? state.pendingDriverGuid : null) ?? '',
            });
        }
        return;
    }
    // --- Splits ---
    const splitMatch = RE_SPLIT.exec(trimmed);
    if (splitMatch) {
        const carSlot = parseInt(splitMatch[1], 10);
        const splitIdx = parseInt(splitMatch[2], 10);
        const ms = parseInt(splitMatch[3], 10);
        const splits = state.pendingSplits.get(carSlot) ?? {};
        if (splitIdx === 0)
            splits.split0Ms = ms;
        else if (splitIdx === 1)
            splits.split1Ms = ms;
        state.pendingSplits.set(carSlot, splits);
        return;
    }
    // --- Lap block ---
    if (trimmed === 'Car.onLapCompleted') {
        state.inLapBlock = true;
        state.activeLapBlock = {};
        return;
    }
    if (trimmed === 'Car.onLapCompleted END') {
        if (state.activeLapBlock?.driverName && state.activeLapBlock.lapTimeMs !== undefined) {
            const block = state.activeLapBlock;
            const splits = state.pendingSplits.get(block.carSlot) ?? {};
            state.currentSessionLaps.push({
                driverName: block.driverName,
                carModel: state.slots.get(block.carSlot)?.carModel ?? '',
                lapTimeMs: block.lapTimeMs,
                lapNumber: block.lapNumber ?? 0,
                cuts: block.cuts ?? 0,
                valid: block.lapTimeMs < INVALID_TIME_MS && (block.cuts ?? 0) === 0,
                split1Ms: splits.split0Ms ?? null,
                split2Ms: splits.split1Ms ?? null,
                split3Ms: null,
                completedAt: state.lastTimestamp,
            });
            state.pendingSplits.delete(block.carSlot);
        }
        state.activeLapBlock = null;
        state.inLapBlock = false;
        return;
    }
    if (state.inLapBlock && state.activeLapBlock !== null) {
        const lapMatch = RE_LAP.exec(trimmed);
        if (lapMatch) {
            const driverName = lapMatch[1].trim();
            state.activeLapBlock.driverName = driverName;
            state.activeLapBlock.lapTimeMs = parseACTime(lapMatch[2]);
            state.activeLapBlock.completedAt = state.lastTimestamp;
            // Find carSlot by driver name
            for (const [slot, info] of state.slots) {
                if (info.name === driverName) {
                    state.activeLapBlock.carSlot = slot;
                    break;
                }
            }
            return;
        }
        const cutsMatch = RE_CUTS.exec(trimmed);
        if (cutsMatch) {
            state.activeLapBlock.cuts = parseInt(cutsMatch[1], 10);
            return;
        }
        // Leaderboard entry — extract lap count for the driver who just finished
        const lbMatch = RE_LEADERBOARD.exec(trimmed);
        if (lbMatch && state.activeLapBlock.driverName) {
            if (lbMatch[1].trim() === state.activeLapBlock.driverName) {
                state.activeLapBlock.lapNumber = parseInt(lbMatch[2], 10);
            }
            return;
        }
    }
    // --- Session transitions ---
    if (trimmed === 'NextSession') {
        finalizeSession(state, state.lastTimestamp);
        state.sessionType = 'PRACTICE';
        state.sessionStartedAt = state.lastTimestamp;
        return;
    }
    if (trimmed.startsWith('Stopped:')) {
        state.sessionEnded = true;
        finalizeSession(state, state.lastTimestamp);
        return;
    }
    const discMatch = RE_DISCONNECTED.exec(trimmed);
    if (discMatch) {
        const name = discMatch[1].trim();
        for (const [slot, info] of state.slots) {
            if (info.name === name) {
                state.slots.delete(slot);
                break;
            }
        }
        return;
    }
}
function parseLines(lines, state) {
    for (const line of lines)
        processLine(line, state);
}
function parseLogContent(content, serverName) {
    const state = newState(serverName);
    const lines = content.replace(/^﻿/, '').split(/\r?\n/);
    parseLines(lines, state);
    if (state.currentSessionLaps.length > 0 || state.track) {
        finalizeSession(state, state.sessionEnded ? state.lastTimestamp : null);
    }
    return { sessions: state.completedSessions };
}
function createParserState(serverName) {
    return newState(serverName);
}
