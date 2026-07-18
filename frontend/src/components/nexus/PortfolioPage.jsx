import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import EquityChart from "./EquityChart";
import Heatmap from "./Heatmap";

const DEFAULTS = [
  { symbol: "RELIANCE.NS", weight: 25 },
  { symbol: "TCS.NS",       weight: 25 },
  { symbol: "HDFCBANK.NS",  weight: 25 },
  { symbol: "INFY.NS",      weight: 25 },
];

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState(DEFAULTS);
  const [period, setPeriod] = useState("1y");
  const [analysis, setAnalysis] = useState(null);
  const [optim, setOptim] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [picked, setPicked] = useState("");
  const [fusion, setFusion] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get("/api/strategies"); setStrategies(Array.isArray(data) ? data : (data?.items || [])); }
      catch { setStrategies([]); }
    })();
  }, []);

  const total = useMemo(() => holdings.reduce((s, h) => s + (+h.weight || 0), 0), [holdings]);
  const balanced = Math.round(total) === 100;

  const setRow = (i, k, v) => setHoldings((h) => h.map((r, j) => j === i ? { ...r, [k]: k === "weight" ? Number(v) : v } : r));
  const addRow = () => setHoldings((h) => [...h, { symbol: "", weight: 0 }]);
  const rmRow = (i) => setHoldings((h) => h.filter((_, j) => j !== i));
  const payload = () => holdings.filter(h => h.symbol && +h.weight > 0).map(h => ({ symbol: h.symbol, weight: (+h.weight) / 100 }));

  const analyse = async () => {
    if (!balanced) { setMsg("The weights must sum to one hundred per cent."); return; }
    setBusy(true); setMsg("Analysing…");
    try { const { data } = await api.post("/api/portfolio/analyze", { holdings: payload(), period }); setAnalysis(data); setMsg("Analysis complete."); }
    catch (e) { setMsg(`Failure — ${e?.message}`); } finally { setBusy(false); }
  };
  const optimise = async (method) => {
    if (!balanced) { setMsg("The weights must sum to one hundred per cent."); return; }
    setBusy(true); setMsg(`Optimising by ${method.toUpperCase()}…`);
    try { const { data } = await api.post("/api/portfolio/optimize", { holdings: payload(), period, method }); setOptim({ ...data, method }); setMsg(`${method.toUpperCase()} complete.`); }
    catch (e) { setMsg(`Failure — ${e?.message}`); } finally { setBusy(false); }
  };
  const fuse = async () => {
    if (!picked) { setMsg("Kindly select a strategy from the vault."); return; }
    if (!balanced) { setMsg("The weights must sum to one hundred per cent."); return; }
    setBusy(true); setMsg("Fusing strategy with portfolio…");
    try {
      const { data } = await api.post("/api/portfolio/backtest", {
        holdings: payload(), period, interval: "1d",
        capital: 100000, cost_bps: 5, strategy_id: picked,
      });
      setFusion(data); setMsg("Fusion complete.");
    } catch (e) { setMsg(`Failure — ${e?.message}`); }
    finally { setBusy(false); }
  };

  const corr = analysis?.correlation || [];
  const labels = holdings.map(h => h.symbol).filter(Boolean);
  const am = analysis?.metrics || {};
  const fm = fusion?.metrics || {};

  return (
    <div className="container-wide">
      <div>
        <div className="small muted italic">Chapter III</div>
        <h1 className="mt-1">The Treasury</h1>
        <p className="italic muted mt-2">A rebalancing of the estate, with the assistance of Mean-Variance and Hierarchical Risk Parity.</p>
      </div>

      <div className="rule mt-8" />

      <section className="section-gap prose max-w-none">
        <p>
          The Treasury proceeds in three parts: an ordinary <span className="italic">analysis</span> of the current
          holdings, an <span className="italic">optimisation</span> of the weights by one of two methods, and,
          finally, a <span className="italic">fusion</span> — the application of a saved strategy to the combined
          equity of the estate.
        </p>
      </section>

      {/* Holdings editor */}
      <section className="section-gap">
        <div className="flex items-baseline justify-between">
          <h3>Holdings</h3>
          <div className="small italic muted">Sum — {total.toFixed(0)}% {balanced ? "(balanced)" : "(imbalanced)"}</div>
        </div>
        <div className="wbar-track mt-3"><div className="wbar-fill" style={{ width: `${Math.min(100, total)}%` }} /></div>

        <table className="plain-table mt-6" data-testid="portfolio-holdings">
          <thead>
            <tr><th style={{ width: 40 }}>№</th><th>Symbol</th><th style={{ width: 160 }}>Weight (%)</th><th style={{ width: 90 }}></th></tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => (
              <tr key={i}>
                <td className="muted italic">{i + 1}.</td>
                <td><input value={h.symbol} onChange={(e) => setRow(i, "symbol", e.target.value.toUpperCase())} data-testid={`holding-symbol-${i}`} /></td>
                <td><input type="number" value={h.weight} onChange={(e) => setRow(i, "weight", e.target.value)} data-testid={`holding-weight-${i}`} /></td>
                <td><button className="btn-link small" onClick={() => rmRow(i)} data-testid={`holding-remove-${i}`}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-wrap gap-3 mt-6 items-center">
          <button className="btn-link" onClick={addRow} data-testid="holding-add">+ Add row</button>
          <span className="muted">·</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} data-testid="portfolio-period" style={{ width: "auto" }}>
            {["3mo","6mo","1y","2y","5y"].map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="btn" onClick={analyse} disabled={busy} data-testid="portfolio-analyse">Analyse</button>
          <button className="btn" onClick={() => optimise("mvo")} disabled={busy} data-testid="portfolio-mvo">Optimise · MVO</button>
          <button className="btn" onClick={() => optimise("hrp")} disabled={busy} data-testid="portfolio-hrp">Optimise · HRP</button>
          {msg && <span className="italic small muted ml-2">{msg}</span>}
        </div>
      </section>

      {/* Analysis */}
      {analysis && (
        <section className="section-gap" data-testid="portfolio-analysis">
          <h3>Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <Stat label="Return" v={am.return ?? am.performance} suf="%" />
            <Stat label="Volatility" v={am.volatility ?? am.vol} suf="%" />
            <Stat label="Sharpe" v={am.sharpe ?? am.Sharpe} />
          </div>
          {corr.length > 0 && (
            <div className="mt-8">
              <h3>Correlation matrix</h3>
              <div className="mt-2 border-t border-b border-[#111] py-4">
                <Heatmap matrix={corr} labels={labels} />
              </div>
              <div className="figure-caption italic">Table I. Pairwise correlation of daily returns over the selected period.</div>
            </div>
          )}
        </section>
      )}

      {/* Optimiser */}
      {optim && (
        <section className="section-gap" data-testid="portfolio-optim">
          <h3>Optimised by {String(optim.method).toUpperCase()}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <WeightsCol title="Before" weights={optim.weights_before} />
            <WeightsCol title="After"  weights={optim.weights_after} />
          </div>
          <MetricsDelta before={optim.metrics_before} after={optim.metrics_after} />
        </section>
      )}

      {/* Fusion */}
      <section className="section-gap">
        <h3>Fusion — apply a saved strategy to this portfolio</h3>
        <div className="flex flex-wrap gap-3 items-baseline mt-3">
          <select value={picked} onChange={(e) => setPicked(e.target.value)} data-testid="fusion-strategy" style={{ width: "auto", minWidth: 260 }}>
            <option value="">Select a strategy from the vault…</option>
            {strategies.map((s) => (
              <option key={s.id || s._id} value={s.id || s._id}>{s.name || s.symbol}</option>
            ))}
          </select>
          <button className="btn" onClick={fuse} disabled={busy || !picked} data-testid="fusion-run">Fuse</button>
        </div>
        {fusion ? (
          <div className="mt-6">
            <div className="figure">
              <EquityChart equity={fusion.equity || []} benchmark={fusion.benchmark || []} testid="fusion-equity" />
              <div className="figure-caption italic">Figure. Strategy-driven portfolio equity (heavier line) against buy-and-hold (lighter line).</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Stat label="CAGR" v={fm.cagr ?? fm.CAGR} suf="%" />
              <Stat label="Sharpe" v={fm.sharpe ?? fm.Sharpe} />
              <Stat label="Max DD" v={fm.max_dd ?? fm.maxDD} suf="%" />
              <Stat label="Trades" v={fm.trades ?? fusion?.trades?.length ?? 0} d={0} />
            </div>
          </div>
        ) : (
          <div className="italic muted small mt-3">Fusion has not yet been performed.</div>
        )}
      </section>

      <div className="rule mt-16" />
      <div className="mt-6 small muted italic">
        Return to <Link to="/lab">the Council</Link> or <Link to="/backtest">the Forge</Link>.
      </div>
    </div>
  );
}

function Stat({ label, v, suf = "", d = 2 }) {
  const val = Number.isFinite(+v) ? (+v).toFixed(d) : "—";
  return (
    <div className="border-t border-[#111] pt-2">
      <div className="small muted italic">{label}</div>
      <div style={{ fontSize: 28, letterSpacing: "-0.01em" }}>{val}{val !== "—" ? suf : ""}</div>
    </div>
  );
}
function WeightsCol({ title, weights }) {
  const entries = weights ? Object.entries(weights) : [];
  return (
    <div>
      <div className="small italic muted mb-2">{title}</div>
      <table className="plain-table">
        <thead><tr><th>Symbol</th><th style={{ width: 90 }}>Weight</th><th></th></tr></thead>
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{((+v) * 100).toFixed(1)}%</td>
              <td style={{ width: 240 }}>
                <div className="wbar-track"><div className="wbar-fill" style={{ width: `${Math.min(100, (+v) * 100)}%` }} /></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function MetricsDelta({ before = {}, after = {} }) {
  const rows = [["Sharpe","sharpe"], ["Volatility","volatility"], ["Return","return"]];
  return (
    <div className="mt-6 grid grid-cols-3 gap-4">
      {rows.map(([label, k]) => {
        const b = +before?.[k]; const a = +after?.[k];
        const shown = Number.isFinite(a) ? a.toFixed(2) : "—";
        const delta = Number.isFinite(a) && Number.isFinite(b) ? (a - b) : null;
        return (
          <div key={k} className="border-t border-[#111] pt-2">
            <div className="small muted italic">{label}</div>
            <div style={{ fontSize: 22 }}>{shown}
              {delta !== null && <span className="italic small muted ml-2">({delta >= 0 ? "+" : ""}{delta.toFixed(2)})</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
