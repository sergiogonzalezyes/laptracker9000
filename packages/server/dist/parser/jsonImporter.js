"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importJsonFile = importJsonFile;
const fs_1 = require("fs");
const path_1 = require("path");
const INVALID_TIME_MS = 999_000_000;
// Filename: 2022_1_28_18_42_PRACTICE.json → parsed date
function parseDateFromFilename(filename) {
    const name = (0, path_1.basename)(filename, '.json');
    const parts = name.split('_');
    if (parts.length >= 5) {
        const [year, month, day, hour, minute] = parts.map(Number);
        return new Date(year, month - 1, day, hour, minute, 0);
    }
    return new Date(0);
}
function importJsonFile(filePath) {
    let raw;
    try {
        raw = (0, fs_1.readFileSync)(filePath, 'utf8');
    }
    catch {
        return null;
    }
    let data;
    try {
        data = JSON.parse(raw);
    }
    catch {
        return null;
    }
    if (!data.Laps || data.Laps.length === 0)
        return null;
    const startedAt = parseDateFromFilename(filePath);
    const laps = data.Laps
        .filter(l => l.LapTime < INVALID_TIME_MS && l.DriverName)
        .map((l, idx) => ({
        driverName: l.DriverName,
        carModel: l.CarModel,
        lapTimeMs: l.LapTime,
        lapNumber: idx + 1,
        cuts: l.Cuts,
        valid: l.LapTime < INVALID_TIME_MS && l.Cuts === 0,
        split1Ms: l.Sectors[0] ?? null,
        split2Ms: l.Sectors[1] ?? null,
        split3Ms: l.Sectors[2] ?? null,
        completedAt: new Date(startedAt.getTime() + l.Timestamp),
    }));
    if (laps.length === 0)
        return null;
    return {
        serverName: 'imported',
        track: data.TrackName,
        trackConfig: data.TrackConfig ?? '',
        sessionType: data.Type,
        startedAt,
        endedAt: null,
        laps,
    };
}
