export interface ParsedLap {
  driverName: string;
  carModel: string;
  lapTimeMs: number;
  lapNumber: number;
  cuts: number;
  valid: boolean;
  split1Ms: number | null;
  split2Ms: number | null;
  split3Ms: number | null;
  completedAt: Date;
}

export interface ParsedSession {
  serverName: string;
  track: string;
  trackConfig: string;
  sessionType: string;
  startedAt: Date;
  endedAt: Date | null;
  laps: ParsedLap[];
}

export interface ParseResult {
  sessions: ParsedSession[];
}
