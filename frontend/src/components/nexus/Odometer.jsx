import { useEffect, useRef, useState } from "react";

// Displays a number with tabular-nums; animates from previous to new value.
export default function Odometer({ value, decimals = 2, suffix = "", className = "" }) {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const target = Number.isFinite(+value) ? +value : 0;
    const start = from.current;
    const dur = 700;
    const t0 = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (target - start) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className={`tabular ${className}`}>
      {display.toFixed(decimals)}{suffix}
    </span>
  );
}
