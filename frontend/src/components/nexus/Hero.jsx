import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import StatusChip from "./StatusChip";
import { PAINTINGS } from "../../lib/paintings";

export default function Hero() {
  const [health, setHealth] = useState({ status: "wait", ollama: "wait", data: "wait" });
  const painting = PAINTINGS[2]; // Aristotle with a Bust of Homer — rich & dark

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const { data } = await api.get("/api/health");
        if (stop) return;
        setHealth({
          status: (data?.status === "ok" || data?.status === "healthy") ? "ok" : "err",
          ollama: (data?.ollama === true || data?.ollama === "ok" || data?.ollama === "up") ? "ok" : "err",
          data: (data?.data === true || data?.data === "ok" || data?.data === "up") ? "ok" : "err",
        });
      } catch { if (!stop) setHealth({ status: "err", ollama: "err", data: "err" }); }
    };
    load();
    const i = setInterval(load, 20000);
    return () => { stop = true; clearInterval(i); };
  }, []);

  return (
    <section id="s1" className="section bg-canvas text-cream" data-testid="section-hero">
      {/* Full-bleed painting */}
      <div className="painting-hero drift" style={{ backgroundImage: `url(${painting.url})` }} />
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(27,20,13,0.35) 0%, rgba(27,20,13,0.1) 40%, rgba(27,20,13,0.9) 100%)" }} />

      {/* Status chips top */}
      <div className="absolute top-24 md:top-28 left-8 md:left-16 z-10 flex items-center gap-6">
        <StatusChip label={`Backend · ${health.status}`} status={health.status} testid="chip-backend" />
        <StatusChip label={`Ollama · ${health.ollama}`} status={health.ollama} testid="chip-ollama" />
        <StatusChip label={`Data · ${health.data}`} status={health.data} testid="chip-data" />
      </div>

      {/* Bottom-left oversized italic hero (Silent Beauty / Timeless Art vibe) */}
      <div className="absolute left-8 md:left-16 bottom-24 z-10 max-w-[92vw]">
        <div className="orn text-sepia mb-4"><span>Presenting</span></div>
        <div className="display-lg text-cream leading-[0.88]">
          <span className="italic-swash">Timeless</span>
          <br/>
          <span className="italic-swash">Strategy</span>
        </div>
        <div className="display-md text-cream/85 italic-swash mt-3">
          Where the market meets the muse.
        </div>
        <div className="mt-6 label text-cream/70">GD · NEXUS · Strategy / Capital / Machine</div>
      </div>

      {/* Right-side card — Silent Beauty right column overlay */}
      <div className="absolute right-8 md:right-16 bottom-24 z-10 max-w-sm hidden md:block">
        <div className="orn text-sepia mb-3"><span>The Gallery</span></div>
        <div className="text-cream/80 leading-relaxed italic">
          A council of ten painters, a forge of hand-cut signals,
          and a treasury that rebalances the masterpiece.
        </div>
        <div className="mt-5 label text-cream/70">— {painting.label} —</div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 label text-cream/80 z-10 flex items-center gap-3">
        <span className="italic-swash normal-case tracking-normal text-lg font-display">Descend</span>
        <span>↓</span>
      </div>
    </section>
  );
}
