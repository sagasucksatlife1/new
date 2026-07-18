import { useEffect, useMemo, useRef, useState } from "react";
import { api, streamUrl } from "../../lib/api";
import { PAINTINGS } from "../../lib/paintings";
import MagneticButton from "./MagneticButton";
import PaintingFrame from "./PaintingFrame";
import Odometer from "./Odometer";
import WireframeDome from "./WireframeDome";

export default function Council({ onOpenInForge }) {
  const [personas, setPersonas] = useState([]);
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [period, setPeriod] = useState("1y");
  const [interval, setIntv] = useState("1d");
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState([]);
  const [survivors, setSurvivors] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [openGraveIdx, setOpenGraveIdx] = useState(null);
  const consoleRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/personas");
        setPersonas(Array.isArray(data) ? data : []);
      } catch { setPersonas([]); }
    })();
  }, []);

  const displayPersonas = personas.length
    ? personas.slice(0, 10)
    : [...Array(10)].map((_, i) => ({ id: `p${i}`, name: `PERSONA ${i + 1}`, philosophy: "Awaiting connection to the council.", style: "OFFLINE" }));

  const scrollConsole = () => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  };

  const summon = async () => {
    if (running) return;
    setRunning(true); setEvents([]); setSurvivors([]); setGraveyard([]);
    try {
      const { data } = await api.post("/api/lab/run", {
        symbol, period, interval,
        personas: personas.slice(0, 10).map(p => p.id),
      });
      const runId = data?.run_id;
      if (!runId) throw new Error("No run_id");
      const es = new EventSource(streamUrl(runId));
      const push = (ev) => { setEvents((p) => [...p, ev]); setTimeout(scrollConsole, 0); };
      es.onmessage = (m) => {
        try {
          const ev = JSON.parse(m.data);
          push(ev);
          if (ev.type === "backtested" && ev.metrics) {
            setSurvivors((p) => [...p, { persona: ev.persona, code: ev.code, metrics: ev.metrics }]);
          } else if (ev.type === "validation_failed" || ev.type === "runtime_error") {
            setGraveyard((p) => [...p, { persona: ev.persona, error: ev.error || ev.description, code: ev.code }]);
          } else if (ev.type === "done") {
            es.close(); setRunning(false);
          }
        } catch { /* ignore */ }
      };
      es.onerror = () => { es.close(); setRunning(false); push({ type: "stage", description: "STREAM CLOSED" }); };
    } catch (e) {
      setEvents((p) => [...p, { type: "runtime_error", description: `SUMMON FAILED: ${e?.message || "offline"}` }]);
      setRunning(false);
    }
  };

  const saveToVault = async (surv) => {
    try {
      await api.post("/api/strategies", {
        name: `${surv.persona || "Anon"} · ${symbol}`,
        code: surv.code, symbol, metrics: surv.metrics,
      });
      setEvents((p) => [...p, { type: "stage", description: `SAVED TO VAULT · ${surv.persona}` }]);
    } catch (e) {
      setEvents((p) => [...p, { type: "runtime_error", description: `SAVE FAILED · ${e?.message}` }]);
    }
  };

  return (
    <section id="s2" className="section bg-ink text-cream" data-testid="section-council">
      {/* Section header */}
      <div className="pt-24 pb-6 px-8 md:px-16 flex items-end justify-between">
        <div>
          <div className="label text-sepia">S/02</div>
          <h2 className="display-lg text-cream mt-3">
            The <br className="hidden md:block"/><span className="italic-swash text-gold">Council</span>
          </h2>
          <div className="orn text-sepia mt-4"><span className="italic-swash text-lg font-display normal-case tracking-normal">Ten painters. One symbol.</span></div>
          <div className="label text-cream/70 mt-3 max-w-lg tracking-[0.22em]">A THOUSAND STRATEGIES ATTEMPTED. ONLY THE SURVIVORS EARN A FRAME.</div>
        </div>
        <div className="hidden md:flex items-end gap-3">
          <div className="label text-muted2">SYMBOL</div>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="field" data-testid="council-symbol" data-cursor="type" />
          <div className="flex gap-1">
            {["1mo","3mo","6mo","1y","2y","5y","max"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`chip ${period===p?"on":""}`} data-testid={`council-period-${p}`}>{p}</button>
            ))}
          </div>
          <div className="flex gap-1">
            {["1d","1h","15m","5m"].map(t => (
              <button key={t} onClick={() => setIntv(t)} className={`chip ${interval===t?"on":""}`} data-testid={`council-tf-${t}`}>{t}</button>
            ))}
          </div>
          <MagneticButton onClick={summon} data-testid="summon-council" cursor="summon">
            {running ? "· SUMMONING ·" : "SUMMON THE COUNCIL"}
          </MagneticButton>
        </div>
      </div>

      {/* Horizontal gallery of persona portraits */}
      <div className="overflow-x-auto thin-scroll">
        <div className="flex gap-8 px-8 md:px-16 pb-10 min-w-max" data-testid="council-gallery">
          {displayPersonas.map((p, i) => (
            <PersonaCard key={p.id} p={p} idx={i} running={running} />
          ))}
        </div>
      </div>

      {/* Live console + Graveyard + Survivors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-8 md:px-16 pb-24">
        {/* Console */}
        <div className="lg:col-span-6 volt-frame bg-ink">
          <div className="flex items-center justify-between px-4 py-3 border-b border-umber">
            <div className="label text-volt">LIVE · SSE CONSOLE</div>
            <div className="flex items-center gap-3 label text-muted2">
              <span>EVENTS · {events.length}</span>
              {running && <WireframeDome size={22} />}
            </div>
          </div>
          <div ref={consoleRef} className="h-72 overflow-y-auto thin-scroll p-3 font-mono text-[11px]" data-testid="council-console">
            {events.length === 0 && <div className="console-line info">AWAITING SUMMONS…</div>}
            {events.map((ev, i) => {
              const t = ev.type;
              const cls = t === "backtested" ? "ok" : t === "validation_failed" || t === "runtime_error" ? "fail" : t === "done" ? "warn" : "info";
              return (
                <div key={i} className={`console-line ${cls}`}>
                  [{String(i).padStart(3, "0")}] {ev.persona ? `<${ev.persona}> ` : ""}
                  {(ev.description || ev.error || ev.type || "").toString().toUpperCase()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Graveyard */}
        <div className="lg:col-span-6 border border-umber bg-surface">
          <div className="flex items-center justify-between px-4 py-3 border-b border-umber">
            <div className="label text-cream">THE GRAVEYARD · FAILED ATTEMPTS ({graveyard.length})</div>
            <div className="label text-muted2">RIP</div>
          </div>
          <div className="max-h-72 overflow-y-auto thin-scroll p-3" data-testid="council-graveyard">
            {graveyard.length === 0 && <div className="label text-muted2">— NO FALLEN YET —</div>}
            {graveyard.map((g, i) => (
              <div key={i} className="border-b border-umber py-2">
                <button
                  onClick={() => setOpenGraveIdx(openGraveIdx === i ? null : i)}
                  className="flex items-center justify-between w-full label hover:text-volt"
                  data-cursor={openGraveIdx === i ? "close" : "open"}
                  data-testid={`grave-toggle-${i}`}
                >
                  <span>&#x271D; {g.persona || "UNKNOWN"} — {(g.error || "ERROR").toString().slice(0, 80).toUpperCase()}</span>
                  <span className="text-volt">{openGraveIdx === i ? "−" : "+"}</span>
                </button>
                {openGraveIdx === i && g.code && (
                  <pre className="mt-2 text-[10px] text-muted2 whitespace-pre-wrap bg-ink p-2 border border-umber max-h-40 overflow-auto thin-scroll">{g.code}</pre>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Survivors */}
        <div className="lg:col-span-12">
          <div className="label text-volt mb-3">SURVIVORS · FRAMED FOR ETERNITY ({survivors.length})</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="council-survivors">
            {survivors.map((s, i) => (
              <SurvivorCard key={i} s={s} idx={i} onSave={() => saveToVault(s)} onOpen={() => onOpenInForge?.(s.code)} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile controls */}
      <div className="md:hidden px-8 pb-10 space-y-3">
        <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} className="field w-full" />
        <div className="flex gap-1 flex-wrap">{["1mo","3mo","6mo","1y","2y","5y"].map(p => <button key={p} onClick={() => setPeriod(p)} className={`chip ${period===p?"on":""}`}>{p}</button>)}</div>
        <div className="flex gap-1 flex-wrap">{["1d","1h","15m","5m"].map(t => <button key={t} onClick={() => setIntv(t)} className={`chip ${interval===t?"on":""}`}>{t}</button>)}</div>
        <MagneticButton onClick={summon} data-testid="summon-council-mobile">SUMMON</MagneticButton>
      </div>
    </section>
  );
}

function PersonaCard({ p, idx, running }) {
  const url = PAINTINGS[idx % PAINTINGS.length].url;
  return (
    <div className="w-[260px] flex-shrink-0" data-testid={`persona-card-${idx}`}>
      <div className="relative">
        <PaintingFrame src={url} alt={p.name} aspect="3/4" overlay={
          running ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <WireframeDome size={140} />
            </div>
          ) : null
        } />
      </div>
      <div className="plaque mt-4">
        <div className="label text-umber mb-2">№{String(idx + 1).padStart(2, "0")} · {(p.style || "STYLE").toUpperCase()}</div>
        <div className="font-display italic-swash text-2xl text-ink leading-tight">{p.name}</div>
        <div className="text-sm text-umber/80 mt-2 leading-snug italic">{p.philosophy}</div>
      </div>
    </div>
  );
}

function SurvivorCard({ s, idx, onSave, onOpen }) {
  const m = s.metrics || {};
  return (
    <div className="volt-frame p-5 bg-surface" data-testid={`survivor-${idx}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="label text-gold">Survivor №{String(idx + 1).padStart(2, "0")}</div>
        <div className="italic-swash text-sepia">{(s.persona || "").toString()}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Metric label="CAGR" v={m.cagr ?? m.CAGR} suffix="%" />
        <Metric label="SHARPE" v={m.sharpe ?? m.Sharpe} />
        <Metric label="MAX DD" v={m.max_dd ?? m.maxDD} suffix="%" />
        <Metric label="WIN" v={m.win_rate ?? m.winRate} suffix="%" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={onSave} className="btn-ghost" data-cursor="save" data-testid={`survivor-save-${idx}`}>SAVE · VAULT</button>
        <button onClick={onOpen} className="btn-ghost" data-cursor="forge" data-testid={`survivor-forge-${idx}`}>OPEN · FORGE</button>
      </div>
    </div>
  );
}

function Metric({ label, v, suffix = "" }) {
  const val = Number.isFinite(+v) ? +v : 0;
  return (
    <div className="border-[0.5px] border-umber/60 p-3">
      <div className="label text-sepia">{label}</div>
      <div className="text-gold text-2xl font-display italic mt-1"><Odometer value={val} decimals={2} suffix={suffix} /></div>
    </div>
  );
}
