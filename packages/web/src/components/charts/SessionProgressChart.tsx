import { useState } from 'react';
import { formatLapTime, trackDisplayName } from '../../api/client';

interface Session {
  id: number;
  track: string;
  session_type: string;
  started_at: string;
  best_ms: number | null;
}

interface Props {
  sessions: Session[];
  height?: number;
  accentColor?: string;
}

const VW = 1000;
const PAD = { top: 10, right: 20, bottom: 36, left: 76 };

export default function SessionProgressChart({ sessions, height = 140, accentColor = '#cc0000' }: Props) {
  const [hovered, setHovered] = useState<(Session & { cx: number; cy: number }) | null>(null);
  const [tooltipLeft, setTooltipLeft] = useState(0);

  const valid = sessions
    .filter(s => s.best_ms && s.best_ms < 999_000_000)
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());

  if (valid.length < 2) return null;

  const times = valid.map(s => s.best_ms!);
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);
  const range = maxMs - minMs || 2000;
  const padMs = range * 0.35;
  const yLo = minMs - padMs;
  const yHi = maxMs + padMs;

  const chartW = VW - PAD.left - PAD.right;
  const chartH = height - PAD.top - PAD.bottom;

  const cx = (i: number) => PAD.left + (i / Math.max(valid.length - 1, 1)) * chartW;
  const cy = (ms: number) => PAD.top + ((yHi - ms) / (yHi - yLo)) * chartH;

  const pts = valid.map((s, i) => ({ ...s, cx: cx(i), cy: cy(s.best_ms!) }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(' ');

  // Trend line (linear regression)
  const n = pts.length;
  const sumX = pts.reduce((s, _, i) => s + i, 0);
  const sumY = pts.reduce((s, p) => s + p.best_ms!, 0);
  const sumXY = pts.reduce((s, p, i) => s + i * p.best_ms!, 0);
  const sumX2 = pts.reduce((s, _, i) => s + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const trendY0 = cy(intercept);
  const trendY1 = cy(slope * (n - 1) + intercept);
  const improving = slope < 0;

  const yTicks = [0, 0.5, 1].map(t => yLo + t * (yHi - yLo));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VW;
    let nearest = pts[0];
    let best = Infinity;
    for (const p of pts) {
      const d = Math.abs(p.cx - svgX);
      if (d < best) { best = d; nearest = p; }
    }
    if (best < 60) {
      setHovered(nearest);
      setTooltipLeft(e.clientX - rect.left);
    } else {
      setHovered(null);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${VW} ${height}`}
        style={{ width: '100%', height, display: 'block' }}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Grid */}
        {yTicks.map((ms, i) => (
          <line key={i}
            x1={PAD.left} y1={cy(ms).toFixed(1)}
            x2={PAD.left + chartW} y2={cy(ms).toFixed(1)}
            stroke="#181818" strokeWidth="1"
          />
        ))}

        {/* Y labels */}
        {yTicks.map((ms, i) => (
          <text key={i}
            x={PAD.left - 8} y={cy(ms) + 4}
            textAnchor="end" fontSize="10" fill="#3a3a3a"
            fontFamily="JetBrains Mono, monospace"
          >
            {formatLapTime(Math.round(ms))}
          </text>
        ))}

        {/* Trend line */}
        <line
          x1={PAD.left} y1={trendY0.toFixed(1)}
          x2={PAD.left + chartW} y2={trendY1.toFixed(1)}
          stroke={improving ? 'var(--green)' : 'var(--red)'}
          strokeWidth="1" strokeDasharray="8 5" opacity="0.25"
        />

        {/* Area */}
        <path
          d={`${linePath} L${pts[pts.length - 1].cx},${PAD.top + chartH} L${PAD.left},${PAD.top + chartH} Z`}
          fill={`${accentColor}08`}
        />

        {/* Line */}
        <path
          d={linePath} fill="none"
          stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
          strokeLinejoin="round" strokeLinecap="round"
        />

        {/* Dots */}
        {pts.map((p, i) => {
          const isBest = p.best_ms === minMs;
          const isHov = hovered?.id === p.id;
          return (
            <circle key={i}
              cx={p.cx.toFixed(1)} cy={p.cy.toFixed(1)}
              r={isHov ? 7 : isBest ? 5.5 : 4}
              fill={isBest ? accentColor : isHov ? 'var(--text-primary)' : '#2a2a2a'}
              stroke={isBest ? accentColor : '#111'}
              strokeWidth="1.5"
            />
          );
        })}

        {/* X labels — just first and last dates */}
        {[pts[0], pts[pts.length - 1]].map((p, i) => (
          <text key={i}
            x={p.cx.toFixed(1)} y={PAD.top + chartH + 22}
            textAnchor={i === 0 ? 'start' : 'end'}
            fontSize="9" fill="#333"
          >
            {new Date(p.started_at).toLocaleDateString()}
          </text>
        ))}

        {/* Trend label */}
        <text
          x={PAD.left + chartW} y={PAD.top + 14}
          textAnchor="end" fontSize="10"
          fill={improving ? 'var(--green)' : 'var(--text-muted)'}
          opacity="0.6"
        >
          {improving ? '↓ improving' : '↑ slower'}
        </text>
      </svg>

      {/* Tooltip */}
      {hovered && hovered.best_ms && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltipLeft + 12, 280),
          top: 4,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-bright)',
          borderRadius: 4,
          padding: '7px 12px',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: hovered.best_ms === minMs ? accentColor : 'var(--text-primary)' }}>
            {formatLapTime(hovered.best_ms)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
            {trackDisplayName(hovered.track)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
            {new Date(hovered.started_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
