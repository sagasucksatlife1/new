import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import Heatmap from "./Heatmap";
import EquityChart from "./EquityChart";
import Odometer from "./Odometer";
import MagneticButton from "./MagneticButton";

const DEFAULT_HOLDINGS = [
  { symbol: "RELIANCE.NS", weight: 25 },
  { symbol: "TCS.NS",       weight: 25 },
  { symbol: "HDFCBANK.NS",  weight: 25 },
  { symbol: "INFY.NS",      weight: 25 },
];

export default function Treasury() {
  const [holdings, setHoldings] = useState(DEFAULT_HOLDINGS);
  const [period, setPeriod] = useState("1y");
  const [analysis, setAnalysis] = useState(null);
  const [optim, setOptim] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [pickedStrat, setPickedStrat] = useState("");
  const [fusion, setFusion] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/strategies");
        setStrategies(Array.isArray(data) ? data : (data?.items || []));
      } catch { setStrategies([]); }
    })();
  }, []);

  const totalWeight = useMemo(() => holdings.reduce((s, h) => s + (+h.weight || 0), 0), [holdings]);
  const balanced = Math.round(totalWeight) === 100;

  const setRow = (i, field, val) => setHoldings((h) => h.map((r, j) => j === i ? { ...r, [field]: field === "weight" ? Number(val) : val } : r));
  const addRow = () => setHoldings((h) => [...h, { symbol: "", weight: 0 }]);
  const rmRow = (i) => setHoldings((h) => h.filter((_, j) => j !== i));

  const analyze = async () => {
    if (!balanced) { setMsg("WEIGHTS MUST SUM TO 100%"); return; }
    setBusy(true); setMsg("ANALYZING…");
    try {
      const payload = holdingsPayload();
      const { data } = await api.post("/api/portfolio/analyze", { holdings: payload, period });
      setAnalysis(data); setMsg("✓ ANALYZED");
    } catch (e) { setMsg(`✗ ${e?.message}`); }
    finally { setBusy(false); }
  };

  const optimize = async (method) => {
    if (!balanced) { setMsg("WEIGHTS MUST SUM TO 100%"); return; }
    setBusy(true); setMsg(`OPTIMIZING · ${method.toUpperCase()}…`);
    try {
      const payload = holdingsPayload();
      const { data } = await api.post("/api/portfolio/optimize", { holdings: payload, period, method });
      setOptim({ ...data, method });
      setMsg(`✓ ${method.toUpperCase()} OPTIMIZED`);
    } catch (e) { setMsg(`✗ ${e?.message}`); }
    finally { setBusy(false); }
  };

  const fusionRun = async () => {
    if (!pickedStrat) { setMsg("PICK A STRATEGY FROM VAULT"); return; }
    if (!balanced) { setMsg("WEIGHTS MUST SUM TO 100%"); return; }
    setBusy(true); setMsg("FUSION BACKTEST · MAY TAKE A MOMENT…");
    try {
      const payload = holdingsPayload();
      const { data } = await api.post("/api/portfolio/backtest", {
        holdings: payload, period, interval: "1d",
        capital: 100000, cost_bps: 5,
        strategy_id: pickedStrat,
      });
      setFusion(data);
      setMsg("✓ FUSION COMPLETE");
    } catch (e) { setMsg(`✗ ${e?.message}`); }
    finally { setBusy(false); }
  };

  const holdingsPayload = () => holdings.filter(h => h.symbol && +h.weight > 0).map(h => ({ symbol: h.symbol, weight: (+h.weight) / 100 }));

  const corr = analysis?.correlation || [];
  const labels = holdings.map(h => h.symbol).filter(Boolean);

  return (
    <section id="s5" className="section bg-canvas text-cream" data-testid="section-treasury">
      <div className="pt-24 pb-6 px-8 md:px-16 flex items-end justify-between">
        <div>
          <div className="label text-sepia">S/05</div>
          <h2 className="display-lg mt-3">
            The <span className="italic-swash text-gold">Treasury</span>
          </h2>
          <div className="orn text-sepia mt-4"><span className="italic-swash text-lg font-display normal-case tracking-normal">A council of assets.</span></div>
          <div className="label text-cream/70 mt-3 max-w-lg tracking-[0.22em]">MVO &amp; HRP RECOMPOSE THE MASTERPIECE.</div>
        </div>
        <div className="hidden md:flex items-end gap-2">
          {["3mo","6mo","1y","2y","5y"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`chip ${period===p?"on":""}`} data-testid={`treasury-period-${p}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 md:px-16 pb-16">
        {/* Holdings editor */}
        <div className="lg:col-span-5 border border-umber bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="label text-volt">HOLDINGS</div>
            <div className="label text-muted2">SUM · {totalWeight.toFixed(0)}%</div>
          </div>
          <div className="h-2 bg-ink border border-umber mb-4">
            <div className={"h-full " + (balanced ? "bg-volt" : "bg-[#ff8a8a]")} style={{ width: `${Math.min(100, totalWeight)}%`, transition: "width 0.3s ease" }} />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto thin-scroll" data-testid="treasury-holdings">
            {holdings.map((h, i) => (
              <div key={i} className="grid grid-cols-[1fr,80px,40px] gap-2 items-center">
                <input value={h.symbol} onChange={(e) => setRow(i, "symbol", e.target.value.toUpperCase())} className="field w-full" placeholder="SYMBOL" data-testid={`treasury-symbol-${i}`} data-cursor="type" />
                <input type="number" value={h.weight} onChange={(e) => setRow(i, "weight", e.target.value)} className="field w-full" placeholder="%" data-testid={`treasury-weight-${i}`} />
                <button onClick={() => rmRow(i)} className="btn-ghost !p-2 text-[10px]" data-testid={`treasury-remove-${i}`}>×</button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={addRow} data-cursor="add" data-testid="treasury-add">+ ADD ROW</button>
            <MagneticButton onClick={analyze} disabled={busy} data-testid="treasury-analyze" cursor="analyze">ANALYZE</MagneticButton>
            <button className="btn-ghost" onClick={() => optimize("mvo")} disabled={busy} data-cursor="mvo" data-testid="treasury-mvo">OPTIMIZE · MVO</button>
            <button className="btn-ghost" onClick={() => optimize("hrp")} disabled={busy} data-cursor="hrp" data-testid="treasury-hrp">OPTIMIZE · HRP</button>
          </div>
          {msg && <div className="label text-volt mt-3">{msg}</div>}
        </div>

        {/* Analysis + Correlation */}
        <div className="lg:col-span-7 border border-umber bg-ink p-4">
          <div className="label text-volt mb-3">CORRELATION · ENGRAVED</div>
          {corr.length > 0 ? (
            <Heatmap matrix={corr} labels={labels} />
          ) : (
            <div className="h-56 flex items-center justify-center label text-muted2">— RUN ANALYZE TO REVEAL —</div>
          )}
          {analysis?.metrics && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <MiniMetric label="RETURN" v={analysis.metrics.return ?? analysis.metrics.performance} suffix="%" />
              <MiniMetric label="VOLATILITY" v={analysis.metrics.volatility ?? analysis.metrics.vol} suffix="%" />
              <MiniMetric label="SHARPE" v={analysis.metrics.sharpe ?? analysis.metrics.Sharpe} />
            </div>
          )}
        </div>

        {/* Optimizer before/after */}
        {optim && (
          <div className="lg:col-span-12 border border-umber bg-ink p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="label text-volt">OPTIMIZED · {String(optim.method || "").toUpperCase()}</div>
              <MetricsDelta before={optim.metrics_before} after={optim.metrics_after} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WeightsCol title="BEFORE" weights={optim.weights_before} />
              <WeightsCol title="AFTER"  weights={optim.weights_after} accent />
            </div>
          </div>
        )}

        {/* Fusion */}
        <div className="lg:col-span-12 volt-frame bg-ink p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="label text-volt">THE FUSION · BACKTEST PORTFOLIO WITH STRATEGY</div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={pickedStrat} onChange={(e) => setPickedStrat(e.target.value)} className="field" data-testid="treasury-fusion-strat" data-cursor="pick">
                <option value="">— PICK A STRATEGY FROM THE VAULT —</option>
                {strategies.map((s) => (
                  <option key={s.id || s._id} value={s.id || s._id}>{s.name || s.symbol}</option>
                ))}
              </select>
              <MagneticButton onClick={fusionRun} disabled={busy || !pickedStrat} data-testid="treasury-fusion-run" cursor="fuse">
                RUN FUSION
              </MagneticButton>
            </div>
          </div>
          {fusion ? (
            <>
              <EquityChart equity={fusion.equity || []} benchmark={fusion.benchmark || []} testid="fusion-equity" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <MiniMetric label="CAGR" v={fusion?.metrics?.cagr ?? fusion?.metrics?.CAGR} suffix="%" />
                <MiniMetric label="SHARPE" v={fusion?.metrics?.sharpe ?? fusion?.metrics?.Sharpe} />
                <MiniMetric label="MAX DD" v={fusion?.metrics?.max_dd ?? fusion?.metrics?.maxDD} suffix="%" />
                <MiniMetric label="TRADES" v={fusion?.metrics?.trades ?? fusion?.trades?.length ?? 0} decimals={0} />
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center label text-muted2">— FUSE A VAULT STRATEGY WITH THIS PORTFOLIO —</div>
          )}
        </div>
      </div>
    </section>
  );
}

function WeightsCol({ title, weights, accent }) {
  const entries = weights ? Object.entries(weights) : [];
  const max = Math.max(0.0001, ...entries.map(([, v]) => +v));
  return (
    <div>
      <div className="label mb-2 text-cream">{title}</div>
      <div className="space-y-2">
        {entries.map(([k, v]) => (
          <div key={k}>
            <div className="flex items-center justify-between label">
              <span>{k}</span>
              <span className={accent ? "text-volt" : "text-cream"}>{((+v) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-1.5 border border-umber">
              <div className={accent ? "bg-volt h-full" : "bg-cream h-full"} style={{ width: `${((+v) / max) * 100}%`, transition: "width 0.7s cubic-bezier(.2,.7,.1,1)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function MetricsDelta({ before = {}, after = {} }) {
  const rows = [
    ["SHARPE", "sharpe"],
    ["VOL%", "volatility"],
    ["RET%", "return"],
  ];
  return (
    <div className="flex items-center gap-4">
      {rows.map(([label, k]) => {
        const b = +before?.[k]; const a = +after?.[k];
        const up = Number.isFinite(a) && Number.isFinite(b) && a >= b;
        return (
          <div key={k} className="label">
            <span className="text-muted2">{label}</span>{" "}
            <span className={up ? "text-volt" : "text-[#ff8a8a]"}>
              {Number.isFinite(a) ? a.toFixed(2) : "—"} {up ? "↑" : "↓"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
function MiniMetric({ label, v, suffix = "", decimals = 2 }) {
  const val = Number.isFinite(+v) ? +v : 0;
  return (
    <div className="border-[0.5px] border-umber/60 p-3 bg-surface">
      <div className="label text-sepia">{label}</div>
      <div className="text-gold font-display italic text-3xl mt-1"><Odometer value={val} decimals={decimals} suffix={suffix} /></div>
    </div>
  );
}
