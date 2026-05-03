interface Props {
  times: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function Sparkline({ times, width = 88, height = 32, color = '#555' }: Props) {
  if (times.length < 2) return null;

  const PAD = 3;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const range = max - min || 1;

  const x = (i: number) => PAD + (i / (times.length - 1)) * (width - PAD * 2);
  const y = (ms: number) => PAD + ((max - ms) / range) * (height - PAD * 2);

  const path = times.map((ms, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(ms).toFixed(1)}`).join(' ');

  const last = times[times.length - 1];
  const first = times[0];
  const improving = last < first;
  const dotColor = improving ? 'var(--green)' : last === min ? 'var(--green)' : color;

  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {/* Area fill */}
      <path
        d={`${path} L${x(times.length - 1)},${height - PAD} L${x(0)},${height - PAD} Z`}
        fill={improving ? 'rgba(0,230,118,0.06)' : 'rgba(255,255,255,0.03)'}
      />
      {/* Line */}
      <path
        d={path} fill="none"
        stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round"
        opacity="0.7"
      />
      {/* Latest lap dot */}
      <circle
        cx={x(times.length - 1).toFixed(1)}
        cy={y(last).toFixed(1)}
        r="3"
        fill={dotColor}
        stroke="#111" strokeWidth="1"
      />
    </svg>
  );
}
