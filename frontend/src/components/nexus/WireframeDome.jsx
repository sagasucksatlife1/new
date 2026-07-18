// Rotating oil-halo instead of a wireframe dome — softer, painterly
export default function WireframeDome({ size = 360, spinning = true }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="-100 -100 200 200" className={spinning ? "spin-slow" : ""} aria-hidden>
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9A567" stopOpacity="0.18" />
          <stop offset="70%" stopColor="#C9A567" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="95" fill="url(#halo)" />
      {[...Array(60)].map((_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const r1 = 70 + (i % 3) * 6;
        const r2 = 95;
        return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke="#C9A567" strokeOpacity="0.35" strokeWidth="0.5" />;
      })}
      <circle r="95" fill="none" stroke="#C9A567" strokeOpacity="0.5" strokeWidth="0.5" />
      <circle r="70" fill="none" stroke="#C9A567" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="1 3" />
      <circle r="1.5" fill="#C9A567" />
    </svg>
  );
}
