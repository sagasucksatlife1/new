import { useEffect, useState } from "react";

function nowIST() {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 3600 * 1000);
  const hh = String(ist.getHours()).padStart(2, "0");
  const mm = String(ist.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} · IST`;
}

export default function TopBar({ onLogout }) {
  const [clock, setClock] = useState(nowIST());
  useEffect(() => {
    const i = setInterval(() => setClock(nowIST()), 30000);
    return () => clearInterval(i);
  }, []);
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (window.__lenis && el) window.__lenis.scrollTo(el, { offset: -20, duration: 1.2 });
    else el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="fixed top-0 left-0 right-0 z-[900] pointer-events-none">
      <div className="flex items-center justify-between px-6 md:px-10 py-5">
        <button
          className="pointer-events-auto text-left"
          onClick={() => scrollTo("s1")}
          data-cursor="home"
          data-testid="topbar-wordmark"
        >
          <div className="font-display italic-swash text-cream text-xl md:text-2xl leading-none">GD Nexus</div>
          <div className="label text-cream/60 mt-1 tracking-[0.32em]">Strategy · Capital · Machine</div>
        </button>
        <nav className="pointer-events-auto hidden md:flex items-center gap-8">
          {[
            ["Council", "s2"],
            ["Forge", "s3"],
            ["Vault", "s4"],
            ["Treasury", "s5"],
          ].map(([label, id]) => (
            <button key={id}
              className="font-display italic text-cream/80 hover:text-gold transition-colors text-sm tracking-[0.14em]"
              onClick={() => scrollTo(id)}
              data-cursor={label.toLowerCase()}
              data-testid={`nav-${id}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="pointer-events-auto flex items-center gap-6">
          <div className="font-display italic text-gold text-sm tabular tracking-[0.18em]" data-testid="clock">{clock}</div>
          <button className="font-display italic text-cream/80 hover:text-gold transition-colors text-sm tracking-[0.16em]" onClick={onLogout} data-cursor="lock" data-testid="logout-btn">
            Logout ↗
          </button>
        </div>
      </div>
    </div>
  );
}
