import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, streamUrl } from "../../lib/api";

const PERIODS = ["1mo","3mo","6mo","1y","2y","5y","max"];
const TFS = ["1d","1h","15m","5m"];

export default function LabPage() {
  const [personas, setPersonas] = useState([]);
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [period, setPeriod] = useState("1y");
  const [interval, setIntv] = useState("1d");
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState([]);
  const [survivors, setSurvivors] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [openGrave, setOpenGrave] = useState(null);
  const consoleRef = useRef(null);

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get("/api/personas"); setPersonas(Array.isArray(data) ? data : []); }
      catch { setPersonas([]); }
    })();
  }, []);

  const displayPersonas = personas.length
    ? personas.slice(0, 10)
    : [...Array(10)].map((_, i) => ({ id: `p${i}`, name: `Persona ${i + 1}`, philosophy: "Awaiting connection to the council.", style: "offline" }));

  const scrollDown = () => { if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight; };

  const summon = async () => {
    if (running) return;
    setRunning(true); setEvents([]); setSurvivors([]); setGraveyard([]);
    try {
      const { data } = await api.post("/api/lab/run", {
        symbol, period, interval,
        personas: personas.slice(0, 10).map(p => p.id),
      });
      const runId = data?.run_id;
      if (!runId) throw new Error("No run identifier returned.");
      const es = new EventSource(streamUrl(runId));
      const push = (ev) => { setEvents((p) => [...p, ev]); setTimeout(scrollDown, 0); };
      es.onmessage = (m) => {
        try {
          const ev = JSON.parse(m.data);
          push(ev);
          if (ev.type === "backtested" && ev.metrics) {
            setSurvivors((p) => [...p, { persona: ev.persona, code: ev.code, metrics: ev.metrics }]);
          } else if (ev.type === "validation_failed" || ev.type === "runtime_error") {
            setGraveyard((p) => [...p, { persona: ev.persona, error: ev.error || ev.description, code: ev.code }]);
          } else if (ev.type === "done") { es.close(); setRunning(false); }
        } catch { /* ignore */ }
      };
      es.onerror = () => { es.close(); setRunning(false); push({ type: "stage", description: "Stream closed." }); };
    } catch (e) {
      setEvents((p) => [...p, { type: "runtime_error", description: `Summons failed: ${e?.message || "terminal offline"}` }]);
      setRunning(false);
    }
  };

  const saveToVault = async (s) => {
    try {
      await api.post("/api/strategies", { name: `${s.persona || "Anon"} · ${symbol}`, code: s.code, symbol, metrics: s.metrics });
      setEvents((p) => [...p, { type: "stage", description: `Saved to vault — ${s.persona}` }]);
    } catch (e) {
      setEvents((p) => [...p, { type: "runtime_error", description: `Save failed — ${e?.message}` }]);
    }
  };

  const openInForge = (code) => {
    try { sessionStorage.setItem("gd_nexus_forge_code", code || ""); } catch {}
    window.location.href = "/backtest";
  };

  return (
    <div className="container">
      <div>
        <div className="small muted italic">Chapter I</div>
        <h1 className="mt-1">The Council</h1>
        <p className="italic muted mt-2">An assembly of ten synthetic minds, convened against a single symbol.</p>
      </div>

      <div className="rule mt-8" />

      <section className="section-gap prose max-w-none">
        <p>
          On summons, each persona is instructed to author a signals function for
          the chosen instrument. Their submissions are validated, executed against
          the historical record, and — where the numbers permit — enrolled among
          the survivors. Failed submissions are not concealed; they are catalogued
          below in the graveyard, that the operator may study them.
        </p>
      </section>

      {/* Controls */}
      <section className="section-gap">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div>
            <div className="small muted">Symbol</div>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} data-testid="lab-symbol" />
          </div>
          <div>
            <div className="small muted">Period</div>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} data-testid="lab-period">
              {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <div className="small muted">Interval</div>
            <select value={interval} onChange={(e) => setIntv(e.target.value)} data-testid="lab-interval">
              {TFS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <button className="btn" onClick={summon} disabled={running} data-testid="summon-council">
              {running ? "Summoning…" : "Summon the Council"}
            </button>
          </div>
        </div>
      </section>

      {/* Personas roster */}
      <section className="section-gap">
        <h3>The roster</h3>
        <table className="plain-table mt-4" data-testid="persona-roster">
          <thead>
            <tr><th style={{ width: 40 }}>№</th><th>Persona</th><th>Style</th><th>Doctrine</th></tr>
          </thead>
          <tbody>
            {displayPersonas.map((p, i) => (
              <tr key={p.id} data-testid={`persona-${i}`}>
                <td className="italic muted">{i + 1}.</td>
                <td className="italic">{p.name}</td>
                <td className="small muted">{p.style || "—"}</td>
                <td className="small">{p.philosophy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Live console */}
      <section className="section-gap">
        <div className="flex items-baseline justify-between">
          <h3>Proceedings</h3>
          <div className="small muted italic">Events — {events.length}</div>
        </div>
        <div ref={consoleRef} className="mt-3 border-t border-b border-[#111] py-3 max-h-72 overflow-y-auto thin-scroll log" data-testid="lab-console">
          {events.length === 0 && <div className="italic muted">Awaiting summons…</div>}
          {events.map((ev, i) => {
            const t = ev.type;
            const cls = t === "validation_failed" || t === "runtime_error" ? "fail" : "";
            return (
              <div key={i} className={`log ${cls}`}>
                <span className="k">{String(i + 1).padStart(3, "0")}</span>
                {ev.persona ? <span className="italic mr-2">{ev.persona}.</span> : null}
                {(ev.description || ev.error || ev.type || "").toString()}
              </div>
            );
          })}
        </div>
      </section>

      {/* Graveyard */}
      <section className="section-gap">
        <h3>The graveyard — {graveyard.length}</h3>
        {graveyard.length === 0 ? (
          <div className="italic muted small mt-2">None fallen yet.</div>
        ) : (
          <ul className="mt-3" data-testid="lab-graveyard">
            {graveyard.map((g, i) => (
              <li key={i} className="border-b border-[#d8d0c2] py-3">
                <div className="flex items-baseline justify-between">
                  <div><span className="italic">{g.persona || "Unknown"}.</span> <span className="small muted italic">{(g.error || "error").toString().slice(0, 200)}</span></div>
                  {g.code && (
                    <button className="btn-link small" onClick={() => setOpenGrave(openGrave === i ? null : i)} data-testid={`grave-toggle-${i}`}>
                      {openGrave === i ? "Hide code" : "Show code"}
                    </button>
                  )}
                </div>
                {openGrave === i && g.code && (
                  <pre className="mt-2 small p-3 border border-[#d8d0c2] whitespace-pre-wrap overflow-auto max-h-64 thin-scroll" style={{ fontFamily: "'Fraunces', serif" }}>{g.code}</pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Survivors */}
      <section className="section-gap">
        <h3>The survivors — {survivors.length}</h3>
        {survivors.length === 0 ? (
          <div className="italic muted small mt-2">None yet framed.</div>
        ) : (
          <table className="plain-table mt-3" data-testid="lab-survivors">
            <thead>
              <tr>
                <th>№</th><th>Persona</th><th>CAGR</th><th>Sharpe</th><th>Max DD</th><th>Win %</th><th></th>
              </tr>
            </thead>
            <tbody>
              {survivors.map((s, i) => {
                const m = s.metrics || {};
                return (
                  <tr key={i} data-testid={`survivor-${i}`}>
                    <td className="muted italic">{i + 1}.</td>
                    <td className="italic">{s.persona || "—"}</td>
                    <td>{fmtN(m.cagr ?? m.CAGR)}</td>
                    <td>{fmtN(m.sharpe ?? m.Sharpe)}</td>
                    <td>{fmtN(m.max_dd ?? m.maxDD)}</td>
                    <td>{fmtN(m.win_rate ?? m.winRate)}</td>
                    <td className="small">
                      <button className="btn-link" onClick={() => saveToVault(s)} data-testid={`survivor-save-${i}`}>Save</button>
                      {" · "}
                      <button className="btn-link" onClick={() => openInForge(s.code)} data-testid={`survivor-forge-${i}`}>Open in Forge</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <div className="rule mt-16" />
      <div className="mt-6 small muted italic">
        When ready, proceed to <Link to="/backtest">the Forge</Link> or the <Link to="/portfolio">Treasury</Link>.
      </div>
    </div>
  );
}

function fmtN(v) { return Number.isFinite(+v) ? (+v).toFixed(2) : "—"; }
