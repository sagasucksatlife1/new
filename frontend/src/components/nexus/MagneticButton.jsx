import { useRef } from "react";

export default function MagneticButton({ children, className = "btn-volt", strength = 0.3, cursor = "run", ...props }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const reset = () => { if (ref.current) ref.current.style.transform = ""; };
  return (
    <button
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={reset}
      data-cursor={cursor}
      {...props}
    >
      {children}
    </button>
  );
}
