import { useMemo } from "react";

// Two-line SVG chart: cream benchmark vs volt strategy.
export default function EquityChart({ equity = [], benchmark = [], height = 240, testid = "equity-chart" }) {
  const { path1, path2, w, h, min, max, area } = useMemo(() => {
    const w = 800, h = height;
    const all = [...equity, ...benchmark];
    if (all.length === 0) return { path1: "", path2: "", w, h, min: 0, max: 1, area: "" };
    const min = Math.min(...all);
    const max = Math.max(...all);
    const rng = max - min || 1;
    const toPath = (arr) => arr.map((v, i) => {
      const x = (i / Math.max(1, arr.length - 1)) * w;
      const y = h - ((v - min) / rng) * (h - 20) - 10;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
    const path1 = toPath(benchmark);
    const path2 = toPath(equity);
    // area under strategy
    let area = "";
    if (equity.length) {
      area = equity.map((v, i) => {
        const x = (i / Math.max(1, equity.length - 1)) * w;
        const y = h - ((v - min) / rng) * (h - 20) - 10;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }).join(" ") + ` L ${w} ${h} L 0 ${h} Z`;
    }
    return { path1, path2, w, h, min, max, area };
  }, [equity, benchmark, height]);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} data-testid={testid} className="block">
      <defs>
        <linearGradient id="voltFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A567" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#C9A567" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* grid */}
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <line key={t} x1="0" x2={w} y1={h * t} y2={h * t} stroke="#6B4A2B" strokeOpacity="0.35" strokeWidth="0.5" strokeDasharray="2 4" />
      ))}
      {area && <path d={area} fill="url(#voltFill)" />}
      {path1 && <path d={path1} stroke="#E7DAB8" strokeWidth="1.5" fill="none" strokeOpacity="0.85" />}
      {path2 && <path d={path2} stroke="#C9A567" strokeWidth="1.8" fill="none" />}
    </svg>
  );
}
