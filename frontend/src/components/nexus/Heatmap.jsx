import { useMemo } from "react";

// Engraved-style heatmap for correlation matrix.
export default function Heatmap({ matrix = [], labels = [], testid = "heatmap" }) {
  const size = matrix.length;
  const cell = 44;
  const pad = 90;
  const w = pad + size * cell + 20;
  const h = pad + size * cell + 20;

  const color = (v) => {
    const clamped = Math.max(-1, Math.min(1, v));
    if (clamped >= 0) {
      const a = clamped;
      return `rgba(201,165,103,${(0.12 + a * 0.7).toFixed(2)})`;
    }
    const a = -clamped;
    return `rgba(139,58,46,${(0.15 + a * 0.6).toFixed(2)})`;
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" className="engrave" data-testid={testid}>
      {/* frame */}
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} fill="#1B140D" stroke="#C9A567" strokeOpacity="0.55" />
      {labels.map((l, i) => (
        <text key={`c-${i}`} x={pad + i * cell + cell / 2} y={pad - 8} textAnchor="middle">{(l || "").slice(0, 6)}</text>
      ))}
      {labels.map((l, i) => (
        <text key={`r-${i}`} x={pad - 8} y={pad + i * cell + cell / 2 + 3} textAnchor="end">{(l || "").slice(0, 6)}</text>
      ))}
      {matrix.map((row, i) => row.map((v, j) => (
        <g key={`${i}-${j}`}>
          <rect x={pad + j * cell} y={pad + i * cell} width={cell - 2} height={cell - 2} fill={color(v)} stroke="#6B4A2B" strokeOpacity="0.5" />
          <text x={pad + j * cell + cell / 2} y={pad + i * cell + cell / 2 + 3} textAnchor="middle" fill={Math.abs(v) > 0.6 ? "#1B140D" : "#E7DAB8"}>
            {Number.isFinite(+v) ? (+v).toFixed(2) : "—"}
          </text>
        </g>
      )))}
    </svg>
  );
}
