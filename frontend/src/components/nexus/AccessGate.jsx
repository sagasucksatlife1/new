import { useEffect, useState } from "react";
import { api, setToken } from "../../lib/api";
import { PAINTINGS } from "../../lib/paintings";

export default function AccessGate({ onAuth }) {
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [glitch, setGlitch] = useState(false);
  const [idx] = useState(() => Math.floor(Math.random() * PAINTINGS.length));
  const painting = PAINTINGS[idx];

  const submit = async (e) => {
    e.preventDefault();
    if (!pwd || busy) return;
    setBusy(true); setErr("");
    try {
      const { data } = await api.post("/api/auth/login", { password: pwd });
      const token = data?.token;
      if (!token) throw new Error("No token");
      setToken(token);
      onAuth?.(token);
    } catch (ex) {
      setGlitch(true);
      setErr(ex?.response?.status === 401 ? "Access denied" : "Machine offline");
      setTimeout(() => setGlitch(false), 500);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { document.title = "GD NEXUS — Access"; }, []);

  return (
    <div className="fixed inset-0 overflow-hidden z-[1000] bg-canvas" data-testid="access-gate">
      {/* Full-bleed painting */}
      <div className={`painting-hero drift ${glitch ? "glitch" : ""}`}
        style={{ backgroundImage: `url(${painting.url})` }}
      />
      {/* Warm vignette + top gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(27,20,13,0.55) 0%, rgba(27,20,13,0.15) 40%, rgba(27,20,13,0.85) 100%)" }} />

      {/* Top ornament */}
      <div className="absolute top-6 left-8 label text-cream tracking-[0.4em]" data-testid="gate-museum-label">GD · NEXUS</div>
      <div className="absolute top-6 right-8 label text-cream/80 tracking-[0.4em]">MUSEO DELLA MACCHINA · MMXXVI</div>

      {/* Bottom-left overlay text — Silent Beauty style */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute left-8 md:left-16 bottom-24 max-w-[92vw]">
          <div className="orn text-sepia mb-3 pointer-events-auto"><span>Presenting</span></div>
          <div className="display-lg text-cream leading-[0.9] pointer-events-auto">
            <span className="italic-swash">Silent</span> <span className="italic-swash">Machine</span>
          </div>
          <div className="display-md text-cream/85 mt-2 italic-swash pointer-events-auto">
            A quiet council between the market &amp; the muse.
          </div>
        </div>
      </div>

      {/* Right-side gate placard */}
      <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-20 w-full max-w-md">
        <form onSubmit={submit} className="plaque" data-testid="gate-form">
          <div className="orn text-umber mb-3"><span>Enter</span></div>
          <div className="font-display italic-swash text-4xl md:text-5xl text-ink leading-[0.95]">
            The <span className="italic-swash">gallery</span>
            <br/>is closed.
          </div>
          <div className="mt-6 label text-umber">Placard · Passphrase</div>
          <input
            autoFocus
            data-testid="gate-input"
            data-cursor="whisper"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="gate-input"
            placeholder="········"
          />
          <div className="mt-6 flex items-center justify-between">
            <button
              type="submit"
              disabled={busy || !pwd}
              className="text-ink font-display italic-swash text-lg tracking-[0.18em] uppercase border-b-[0.5px] border-ink pb-1 hover:tracking-[0.3em] transition-all"
              data-testid="gate-submit"
              data-cursor="enter"
            >
              {busy ? "· opening ·" : "enter →"}
            </button>
            {err && <div className="italic text-burnt text-sm" data-testid="gate-error">{err}</div>}
          </div>
          <div className="mt-4 text-[11px] italic text-umber/70 leading-relaxed">
            no signup, no username — only those who know the word may pass.
          </div>
        </form>
      </div>

      {/* Painting attribution */}
      <div className="absolute bottom-6 left-8 label text-cream/70 z-10" data-testid="gate-painting-label">
        Canvas — {painting.label}
      </div>
      <div className="absolute bottom-6 right-8 label text-cream/70 z-10">Paper trading only · Not investment advice</div>
    </div>
  );
}
