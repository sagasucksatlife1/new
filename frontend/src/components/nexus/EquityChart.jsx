import { useMemo } from "react";

// Plain black-on-white two-line SVG chart. Heavier line = strategy, thin = benchmark.
export default function EquityChart({ equity = [], benchmark = [], height = 240, testid = "equity-chart" }) {
  const { path1, path2, w, h } = useMemo(() => {
    const w = 900, h = height;
    const all = [...equity, ...benchmark];
    if (all.length === 0) return { path1: "", path2: "", w, h };
    const min = Math.min(...all);
    const max = Math.max(...all);
    const rng = max - min || 1;
    const toPath = (arr) => arr.map((v, i) => {
      const x = (i / Math.max(1, arr.length - 1)) * w;
      const y = h - ((v - min) / rng) * (h - 20) - 10;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
    return { path1: toPath(benchmark), path2: toPath(equity), w, h };
  }, [equity, benchmark, height]);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} data-testid={testid} className="block">
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1="0" x2={w} y1={h * t} y2={h * t} stroke="#e6e0d0" strokeWidth="0.5" />
      ))}
      {path1 && <path d={path1} stroke="#111" strokeWidth="0.6" fill="none" strokeOpacity="0.55" />}
      {path2 && <path d={path2} stroke="#111" strokeWidth="1.8" fill="none" />}
    </svg>
  );
}
