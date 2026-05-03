import { readFileSync } from 'fs';
import { basename } from 'path';
import { ParsedSession, ParsedLap } from './types';

interface ACJsonLap {
  DriverName: string;
  DriverGuid: string;
  CarId: number;
  CarModel: string;
  Timestamp: number;
  LapTime: number;
  Sectors: number[];
  Cuts: number;
  BallastKG: number;
  Tyre: string;
  Restrictor: number;
}

interface ACJsonResult {
  TrackName: string;
  TrackConfig: string;
  Type: string;
  DurationSecs: number;
  RaceLaps: number;
  Laps: ACJsonLap[];
}

const INVALID_TIME_MS = 999_000_000;

// Filename: 2022_1_28_18_42_PRACTICE.json → parsed date
function parseDateFromFilename(filename: string): Date {
  const name = basename(filename, '.json');
  const parts = name.split('_');
  if (parts.length >= 5) {
    const [year, month, day, hour, minute] = parts.map(Number);
    return new Date(year, month - 1, day, hour, minute, 0);
  }
  return new Date(0);
}

export function importJsonFile(filePath: string): ParsedSession | null {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }

  let data: ACJsonResult;
  try {
    data = JSON.parse(raw) as ACJsonResult;
  } catch {
    return null;
  }

  if (!data.Laps || data.Laps.length === 0) return null;

  const startedAt = parseDateFromFilename(filePath);

  const laps: ParsedLap[] = data.Laps
    .filter(l => l.LapTime < INVALID_TIME_MS && l.DriverName)
    .map((l, idx) => ({
      driverName:  l.DriverName,
      carModel:    l.CarModel,
      lapTimeMs:   l.LapTime,
      lapNumber:   idx + 1,
      cuts:        l.Cuts,
      valid:       l.LapTime < INVALID_TIME_MS && l.Cuts === 0,
      split1Ms:    l.Sectors[0] ?? null,
      split2Ms:    l.Sectors[1] ?? null,
      split3Ms:    l.Sectors[2] ?? null,
      completedAt: new Date(startedAt.getTime() + l.Timestamp),
    }));

  if (laps.length === 0) return null;

  return {
    serverName:   'imported',
    track:        data.TrackName,
    trackConfig:  data.TrackConfig ?? '',
    sessionType:  data.Type,
    startedAt,
    endedAt:      null,
    laps,
  };
}
