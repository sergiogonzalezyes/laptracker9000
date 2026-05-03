// Minimal self-contained log parser for the agent (no DB dependency)
export interface AgentParsedLap {
  driverName: string;
  carModel: string;
  lapTimeMs: number;
  lapNumber: number;
  cuts: number;
  valid: boolean;
  split1Ms: number | null;
  split2Ms: number | null;
  track: string;
  sessionType: string;
  completedAt: Date;
}

export interface AgentParsedSession {
  serverName: string;
  track: string;
  sessionType: string;
}

type EventHandler = (event: AgentParsedLap | AgentParsedSession) => void;

function parseACTime(s: string): number {
  const parts = s.split(':');
  if (parts.length !== 3) return 999999999;
  const [m, sec, ms] = parts.map(Number);
  return m * 60_000 + sec * 1_000 + ms;
}

interface Slot { name: string; carModel: string; }

export class AgentParser {
  private track = '';
  private sessionType = 'PRACTICE';
  private serverName: string;
  private slots = new Map<number, Slot>();
  private pendingSplits = new Map<number, { split0Ms?: number; split1Ms?: number }>();
  private inBlock = false;
  private activeBlock: {
    driverName?: string; lapTimeMs?: number; cuts?: number; lapNumber?: number; carSlot?: number; completedAt?: Date;
  } | null = null;
  private afterVersion = false;
  private inPickup = false;
  private pendingName: string | null = null;
  private lastTimestamp = new Date();

  constructor(serverName: string, private onEvent: EventHandler) {
    this.serverName = serverName;
  }

  processLine(line: string): void {
    const t = line.replace(/^﻿/, '').trim();
    if (!t) return;

    const tsMatch = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/.exec(t);
    if (tsMatch) { const d = new Date(tsMatch[1]); if (!isNaN(d.getTime())) this.lastTimestamp = d; return; }

    if (t.startsWith('TRACK=')) { this.track = t.slice(6).trim(); return; }
    if (t.startsWith('TYPE='))  { this.sessionType = t.slice(5).trim(); return; }

    const carList = /^CAR:\s+(\d+)\s+(\S+)\s+\(\d+\)/.exec(t);
    if (carList) { const s = parseInt(carList[1],10); if (!this.slots.has(s)) this.slots.set(s,{name:'',carModel:carList[2]}); return; }

    if (t.startsWith('NEW PICKUP CONNECTION')) { this.inPickup=true; this.afterVersion=false; this.pendingName=null; return; }
    if (t.startsWith('VERSION') && this.inPickup) { this.afterVersion=true; return; }
    if (this.afterVersion && this.inPickup) { this.pendingName=t; this.afterVersion=false; return; }

    const dispatch = /^Dispatching TCP message to (\S+) \((\d+)\) \[(.+?) \[\]\]/.exec(t);
    if (dispatch) {
      const slot=parseInt(dispatch[2],10);
      const name=dispatch[3].trim();
      if (name) this.slots.set(slot,{name,carModel:dispatch[1]});
      return;
    }

    const split = /^Car\.onSplitCompleted\s+(\d+)\s+(\d+)\s+(\d+)/.exec(t);
    if (split) {
      const slot=parseInt(split[1],10),idx=parseInt(split[2],10),ms=parseInt(split[3],10);
      const s=this.pendingSplits.get(slot)??{};
      if(idx===0)s.split0Ms=ms; else if(idx===1)s.split1Ms=ms;
      this.pendingSplits.set(slot,s);
      return;
    }

    if (t === 'Car.onLapCompleted') { this.inBlock=true; this.activeBlock={}; return; }
    if (t === 'Car.onLapCompleted END') {
      if (this.activeBlock?.driverName && this.activeBlock.lapTimeMs !== undefined) {
        const b = this.activeBlock;
        const splits = this.pendingSplits.get(b.carSlot??-1)??{};
        const lap: AgentParsedLap = {
          driverName: b.driverName!,
          carModel: this.slots.get(b.carSlot??-1)?.carModel??'',
          lapTimeMs: b.lapTimeMs!,
          lapNumber: b.lapNumber??0,
          cuts: b.cuts??0,
          valid: b.lapTimeMs! < 999_000_000 && (b.cuts??0)===0,
          split1Ms: splits.split0Ms??null,
          split2Ms: splits.split1Ms??null,
          track: this.track,
          sessionType: this.sessionType,
          completedAt: b.completedAt??this.lastTimestamp,
        };
        this.onEvent(lap);
        this.pendingSplits.delete(b.carSlot??-1);
      }
      this.activeBlock=null; this.inBlock=false;
      return;
    }

    if (this.inBlock && this.activeBlock!==null) {
      const lapLine = /^LAP\s+(.+?)\s+(\d+:\d+:\d+)\s*$/.exec(t);
      if (lapLine) {
        this.activeBlock.driverName=lapLine[1].trim();
        this.activeBlock.lapTimeMs=parseACTime(lapLine[2]);
        this.activeBlock.completedAt=this.lastTimestamp;
        for (const [slot,info] of this.slots) {
          if (info.name===this.activeBlock.driverName) { this.activeBlock.carSlot=slot; break; }
        }
        return;
      }
      const cuts = /^Result\.OnLapCompleted\.\s*Cuts:\s*(\d+)/.exec(t);
      if (cuts) { this.activeBlock.cuts=parseInt(cuts[1],10); return; }
      const lb = /^\d+\)\s+(.+?)\s+BEST:.*?Laps:(\d+)/.exec(t);
      if (lb && this.activeBlock.driverName && lb[1].trim()===this.activeBlock.driverName) {
        this.activeBlock.lapNumber=parseInt(lb[2],10);
      }
    }
  }

  processLines(lines: string[]): void {
    for (const line of lines) this.processLine(line);
  }
}
