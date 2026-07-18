// Plain grayscale correlation matrix — black ink density = magnitude.
export default function Heatmap({ matrix = [], labels = [], testid = "heatmap" }) {
  const size = matrix.length;
  const cell = 46;
  const pad = 90;
  const w = pad + size * cell + 20;
  const h = pad + size * cell + 20;

  const fill = (v) => {
    const c = Math.max(-1, Math.min(1, v));
    const alpha = Math.abs(c);
    return `rgba(17,17,17,${(0.05 + alpha * 0.85).toFixed(2)})`;
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" data-testid={testid} style={{ background: "#fff" }}>
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} fill="#fff" stroke="#111" strokeWidth="0.5" />
      {labels.map((l, i) => (
        <text key={`c-${i}`} x={pad + i * cell + cell / 2} y={pad - 10} textAnchor="middle"
          style={{ fill: "#111", fontFamily: "'Fraunces', serif", fontSize: 11, fontStyle: "italic" }}>
          {(l || "").slice(0, 8)}
        </text>
      ))}
      {labels.map((l, i) => (
        <text key={`r-${i}`} x={pad - 10} y={pad + i * cell + cell / 2 + 3} textAnchor="end"
          style={{ fill: "#111", fontFamily: "'Fraunces', serif", fontSize: 11, fontStyle: "italic" }}>
          {(l || "").slice(0, 8)}
        </text>
      ))}
      {matrix.map((row, i) => row.map((v, j) => {
        const bg = fill(v);
        const on = Math.abs(v) > 0.55;
        return (
          <g key={`${i}-${j}`}>
            <rect x={pad + j * cell} y={pad + i * cell} width={cell - 2} height={cell - 2} fill={bg} stroke="#111" strokeOpacity="0.15" />
            <text x={pad + j * cell + cell / 2} y={pad + i * cell + cell / 2 + 3} textAnchor="middle"
              style={{ fill: on ? "#fff" : "#111", fontFamily: "'Fraunces', serif", fontSize: 12 }}>
              {Number.isFinite(+v) ? (+v).toFixed(2) : "—"}
            </text>
          </g>
        );
      }))}
    </svg>
  );
}
