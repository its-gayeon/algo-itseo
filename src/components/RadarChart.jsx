// Pure SVG radar chart — no dependencies
export default function RadarChart({ data, size = 380, maxVal = 100 }) {
  if (!data || data.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.36;
  const labelR = R + 28;
  const levels = 4;
  const n = data.length;

  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, r) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const dataPoints = data.map((d, i) => pt(i, (d.score / maxVal) * R));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  const rings = Array.from({ length: levels }, (_, li) => {
    const r = (R * (li + 1)) / levels;
    const pts = Array.from({ length: n }, (_, i) => { const p = pt(i, r); return `${p.x},${p.y}`; }).join(" ");
    return <polygon key={li} points={pts} fill="none" stroke="var(--border, #ddd)" strokeWidth="1" strokeDasharray="4 3" />;
  });

  const spokes = Array.from({ length: n }, (_, i) => {
    const { x, y } = pt(i, R);
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border, #ddd)" strokeWidth="1" strokeDasharray="4 3" />;
  });

  const labels = data.map((d, i) => {
    const { x, y } = pt(i, labelR);
    const anchor = x < cx - 4 ? "end" : x > cx + 4 ? "start" : "middle";
    return (
      <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
        fontSize="11" fill="currentColor" className="text-muted-foreground select-none">
        {d.name}
      </text>
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {rings}
      {spokes}
      <path d={dataPath} fill="var(--primary, #df3e66)" fillOpacity="0.15"
        stroke="var(--primary, #df3e66)" strokeWidth="2" strokeLinejoin="round" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5}
          fill="var(--primary, #df3e66)" stroke="white" strokeWidth="1.5" />
      ))}
      {labels}
    </svg>
  );
}
