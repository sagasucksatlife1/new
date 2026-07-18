import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);
  const [labelText, setLabelText] = useState("");

  useEffect(() => {
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let rx = x, ry = y;
    let raf;

    const move = (e) => {
      x = e.clientX; y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      if (label.current) label.current.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const over = (e) => {
      const t = e.target.closest?.("[data-cursor]");
      if (t) {
        ring.current?.classList.add("active");
        const l = t.getAttribute("data-cursor") || "";
        setLabelText(l);
        label.current?.classList.toggle("visible", !!l);
      }
    };
    const out = (e) => {
      const t = e.target.closest?.("[data-cursor]");
      if (t) {
        ring.current?.classList.remove("active");
        setLabelText("");
        label.current?.classList.remove("visible");
      }
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="nexus-cursor-ring" data-testid="nexus-cursor-ring" />
      <div ref={dot} className="nexus-cursor-dot" data-testid="nexus-cursor-dot" />
      <div ref={label} className="nexus-cursor-label" data-testid="nexus-cursor-label">{labelText}</div>
    </>
  );
}
