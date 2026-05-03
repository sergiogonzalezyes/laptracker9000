import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { formatLapTime } from '../../api/client';
const VW = 1000; // virtual SVG width — scales to container
const PAD = { top: 10, right: 20, bottom: 28, left: 76 };
export default function LapTimeChart({ laps, height = 150, accentColor = 'var(--accent)' }) {
    const [hovered, setHovered] = useState(null);
    const [tooltipLeft, setTooltipLeft] = useState(0);
    const valid = laps.filter(l => l.valid);
    if (valid.length < 2)
        return null;
    const times = valid.map(l => l.lapTimeMs);
    const minMs = Math.min(...times);
    const maxMs = Math.max(...times);
    const range = maxMs - minMs || 2000;
    const padMs = range * 0.3;
    const yLo = minMs - padMs;
    const yHi = maxMs + padMs;
    const chartW = VW - PAD.left - PAD.right;
    const chartH = height - PAD.top - PAD.bottom;
    const cx = (i) => PAD.left + (i / Math.max(valid.length - 1, 1)) * chartW;
    const cy = (ms) => PAD.top + ((yHi - ms) / (yHi - yLo)) * chartH;
    const pts = valid.map((l, i) => ({ ...l, cx: cx(i), cy: cy(l.lapTimeMs) }));
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L${pts[pts.length - 1].cx},${PAD.top + chartH} L${PAD.left},${PAD.top + chartH} Z`;
    // Y axis ticks
    const yTicks = [0, 0.33, 0.67, 1].map(t => yLo + t * (yHi - yLo));
    const bestY = cy(minMs);
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const svgX = ((e.clientX - rect.left) / rect.width) * VW;
        let nearest = pts[0];
        let best = Infinity;
        for (const p of pts) {
            const d = Math.abs(p.cx - svgX);
            if (d < best) {
                best = d;
                nearest = p;
            }
        }
        if (best < 50) {
            setHovered(nearest);
            setTooltipLeft(e.clientX - rect.left);
        }
        else {
            setHovered(null);
        }
    };
    return (_jsxs("div", { style: { position: 'relative' }, children: [_jsxs("svg", { viewBox: `0 0 ${VW} ${height}`, style: { width: '100%', height, display: 'block' }, preserveAspectRatio: "none", onMouseMove: handleMouseMove, onMouseLeave: () => setHovered(null), children: [yTicks.map((ms, i) => (_jsx("line", { x1: PAD.left, y1: cy(ms).toFixed(1), x2: PAD.left + chartW, y2: cy(ms).toFixed(1), stroke: "#181818", strokeWidth: "1" }, i))), yTicks.filter((_, i) => i % 2 === 1 || i === 0 || i === 3).map((ms, i) => (_jsx("text", { x: PAD.left - 8, y: cy(ms) + 4, textAnchor: "end", fontSize: "10", fill: "#3a3a3a", fontFamily: "JetBrains Mono, monospace", children: formatLapTime(Math.round(ms)) }, i))), _jsx("line", { x1: PAD.left, y1: bestY.toFixed(1), x2: PAD.left + chartW, y2: bestY.toFixed(1), stroke: "var(--green)", strokeWidth: "1", strokeDasharray: "6 4", opacity: "0.3" }), _jsx("path", { d: areaPath, fill: "rgba(255,255,255,0.025)" }), _jsx("path", { d: linePath, fill: "none", stroke: "rgba(255,255,255,0.35)", strokeWidth: "1.5", strokeLinejoin: "round", strokeLinecap: "round" }), pts.map((p, i) => {
                        const isBest = p.lapTimeMs === minMs;
                        const isHov = hovered?.lapNumber === p.lapNumber;
                        return (_jsx("circle", { cx: p.cx.toFixed(1), cy: p.cy.toFixed(1), r: isHov ? 6 : isBest ? 5 : 3.5, fill: isBest ? 'var(--green)' : isHov ? 'var(--text-primary)' : '#333', stroke: isBest ? 'var(--green)' : '#111', strokeWidth: "1.5" }, i));
                    }), pts.filter((_, i) => i === 0 || i === pts.length - 1 || (pts.length > 6 && i % Math.ceil(pts.length / 6) === 0)).map((p, i) => (_jsx("text", { x: p.cx.toFixed(1), y: PAD.top + chartH + 20, textAnchor: "middle", fontSize: "9", fill: "#333", children: p.lapNumber }, i)))] }), hovered && (_jsxs("div", { style: {
                    position: 'absolute',
                    left: Math.min(tooltipLeft + 12, 300),
                    top: 4,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-bright)',
                    borderRadius: 4,
                    padding: '6px 10px',
                    pointerEvents: 'none',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                }, children: [_jsx("div", { style: { fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: hovered.lapTimeMs === minMs ? 'var(--green)' : 'var(--text-primary)' }, children: formatLapTime(hovered.lapTimeMs) }), _jsxs("div", { style: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8 }, children: [_jsxs("span", { children: ["Lap ", hovered.lapNumber] }), hovered.lapTimeMs === minMs && _jsx("span", { style: { color: 'var(--green)' }, children: "Best" }), hovered.isPB && _jsx("span", { style: { color: 'var(--green)' }, children: "PB" })] })] }))] }));
}
