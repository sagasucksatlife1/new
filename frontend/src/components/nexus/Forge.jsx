import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { api } from "../../lib/api";
import Odometer from "./Odometer";
import EquityChart from "./EquityChart";
import MagneticButton from "./MagneticButton";

const DEFAULT_CODE = `# GD NEXUS · Forge · Signals Contract
# Return a pandas Series named 'signal' aligned to df.index:
#   +1 = long,  0 = flat,  -1 = short.
# Available: df (OHLCV), pd, np.
def generate_signals(df):
    import pandas as pd
    fast = df['Close'].rolling(20).mean()
    slow = df['Close'].rolling(50).mean()
    signal = (fast > slow).astype(int) - (fast < slow).astype(int)
    return pd.Series(signal, index=df.index, name='signal')
`;

const PERIODS = ["1mo","3mo","6mo","1y","2y","5y","max"];
const TFS = ["1d","1h","15m","5m"];

export default function Forge({ initialCode, onSavedToVault }) {
  const [code, setCode] = useState(initialCode || DEFAULT_CODE);
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [period, setPeriod] = useState("1y");
  const [interval, setIntv] = useState("1d");
  const [leverage, setLev] = useState(1);
  const [cost, setCost] = useState(5);
  const [capital, setCap] = useState(100000);
  const [sl, setSL] = useState(0);
  const [tp, setTP] = useState(0);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { if (initialCode) setCode(initialCode); }, [initialCode]);

  const validate = async () => {
    setBusy(true); setMsg("VALIDATING…");
    try {
      const { data } = await api.post("/api/backtest/validate", { code });
      setMsg(data?.valid ? "✓ SIGNALS CONTRACT OK" : `✗ ${data?.error || "INVALID"}`);
    } catch (e) { setMsg(`✗ ${e?.message || "OFFLINE"}`); }
    finally { setBusy(false); }
  };

  const run = async () => {
    setBusy(true); setMsg("RUNNING BACKTEST…"); setResult(null);
    try {
      const { data } = await api.post("/api/backtest", {
        code, symbol, period, interval,
        capital: Number(capital), cost_bps: Number(cost),
        leverage: Number(leverage), stop_loss: Number(sl), take_profit: Number(tp),
      });
      setResult(data);
      setMsg(`✓ BACKTEST COMPLETE · ${(data?.trades?.length || 0)} TRADES`);
    } catch (e) { setMsg(`✗ ${e?.response?.data?.detail || e?.message || "OFFLINE"}`); }
    finally { setBusy(false); }
  };

  const save = async () => {
    try {
      await api.post("/api/strategies", {
        name: `Forge · ${symbol} · ${new Date().toISOString().slice(0,10)}`,
        code, symbol, metrics: result?.metrics || null,
      });
      setMsg("✓ SAVED TO VAULT");
      onSavedToVault?.();
    } catch (e) { setMsg(`✗ SAVE FAILED · ${e?.message}`); }
  };

  const metrics = result?.metrics || {};

  return (
    <section id="s3" className="section bg-canvas text-cream" data-testid="section-forge">
      <div className="pt-24 pb-6 px-8 md:px-16">
        <div className="label text-sepia">S/03</div>
        <h2 className="display-lg mt-3">
          The <span className="italic-swash text-gold">Forge</span>
        </h2>
        <div className="orn text-sepia mt-4"><span className="italic-swash text-lg font-display normal-case tracking-normal">Hand-cut signals, hammered by time.</span></div>
        <div className="label text-cream/70 mt-3 max-w-lg tracking-[0.22em]">FRAME THE SURVIVORS. BURN THE REST.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-8 md:px-16 pb-16">
        {/* Editor */}
        <div className="lg:col-span-8 border border-umber">
          <div className="flex items-center justify-between px-3 py-2 border-b border-umber bg-surface">
            <div className="label text-volt">EDITOR · GENERATE_SIGNALS.PY</div>
            <div className="label text-muted2">{msg}</div>
          </div>
          <div style={{ height: 480 }} data-testid="forge-editor">
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              options={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                cursorBlinking: "phase",
                renderLineHighlight: "all",
                lineNumbersMinChars: 3,
                padding: { top: 10, bottom: 10 },
              }}
              beforeMount={(monaco) => {
                monaco.editor.defineTheme("nexus", {
                  base: "vs-dark", inherit: true,
                  rules: [
                    { token: "keyword", foreground: "C9A567", fontStyle: "italic" },
                    { token: "string", foreground: "E4C48C" },
                    { token: "number", foreground: "C9A567" },
                    { token: "comment", foreground: "8B7355", fontStyle: "italic" },
                  ],
                  colors: {
                    "editor.background": "#1B140D",
                    "editor.foreground": "#E7DAB8",
                    "editorLineNumber.foreground": "#6B4A2B",
                    "editorCursor.foreground": "#C9A567",
                    "editor.selectionBackground": "#C9A56722",
                  },
                });
                monaco.editor.setTheme("nexus");
              }}
              onMount={(_editor, monaco) => monaco.editor.setTheme("nexus")}
            />
          </div>
        </div>

        {/* Run Config panel — F1 pit wall */}
        <div className="lg:col-span-4 border border-umber bg-surface p-4">
          <div className="label text-volt mb-3">RUN CONFIG · PIT WALL</div>
          <Row label="SYMBOL">
            <input value={symbol} onChange={(e)=>setSymbol(e.target.value.toUpperCase())} className="field w-full" data-testid="forge-symbol" data-cursor="type" />
          </Row>
          <Row label="PERIOD">
            <div className="flex gap-1 flex-wrap">{PERIODS.map(p => <button key={p} onClick={() => setPeriod(p)} className={`chip ${period===p?"on":""}`} data-testid={`forge-period-${p}`}>{p}</button>)}</div>
          </Row>
          <Row label="TIMEFRAME">
            <div className="flex gap-1 flex-wrap">{TFS.map(t => <button key={t} onClick={() => setIntv(t)} className={`chip ${interval===t?"on":""}`} data-testid={`forge-tf-${t}`}>{t}</button>)}</div>
          </Row>
          <Row label={`LEVERAGE · ${leverage}x`}>
            <input type="range" min={1} max={10} step={1} value={leverage} onChange={(e)=>setLev(+e.target.value)} className="volt-range" data-testid="forge-leverage" />
          </Row>
          <Row label="COST · BPS">
            <input type="number" value={cost} onChange={(e)=>setCost(e.target.value)} className="field w-full" data-testid="forge-cost" />
          </Row>
          <Row label="CAPITAL · ₹">
            <input type="number" value={capital} onChange={(e)=>setCap(e.target.value)} className="field w-full" data-testid="forge-capital" />
          </Row>
          <div className="grid grid-cols-2 gap-3">
            <Row label="SL %"><input type="number" value={sl} onChange={(e)=>setSL(e.target.value)} className="field w-full" data-testid="forge-sl" /></Row>
            <Row label="TP %"><input type="number" value={tp} onChange={(e)=>setTP(e.target.value)} className="field w-full" data-testid="forge-tp" /></Row>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={validate} disabled={busy} className="btn-ghost" data-cursor="check" data-testid="forge-validate">VALIDATE</button>
            <MagneticButton onClick={run} disabled={busy} data-testid="forge-run" cursor="run">RUN BACKTEST</MagneticButton>
            <button onClick={save} disabled={!result} className="btn-ghost" data-cursor="save" data-testid="forge-save">SAVE</button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="px-8 md:px-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-4" data-testid="forge-results">
          <div className="lg:col-span-8 border border-umber p-4 bg-ink">
            <div className="flex items-center justify-between mb-3">
              <div className="label text-cream">EQUITY · <span className="text-volt">STRATEGY</span> VS <span>BUY & HOLD</span></div>
              <div className="label text-muted2">CREAM = BENCHMARK · VOLT = STRATEGY</div>
            </div>
            <EquityChart equity={result.equity || []} benchmark={result.benchmark || []} testid="forge-equity" />
            <div className="mt-6">
              <div className="label text-cream mb-2">DRAWDOWN</div>
              <EquityChart equity={result.drawdown || []} benchmark={[]} height={100} testid="forge-drawdown" />
            </div>
          </div>
          <div className="lg:col-span-4 space-y-3">
            <MetricCard label="CAGR" v={metrics.cagr ?? metrics.CAGR} suffix="%" />
            <MetricCard label="SHARPE" v={metrics.sharpe ?? metrics.Sharpe} />
            <MetricCard label="MAX DRAWDOWN" v={metrics.max_dd ?? metrics.maxDD} suffix="%" />
            <MetricCard label="WIN RATE" v={metrics.win_rate ?? metrics.winRate} suffix="%" />
            <MetricCard label="TRADES" v={metrics.trades ?? result?.trades?.length ?? 0} decimals={0} />
          </div>
          <div className="lg:col-span-12 border border-umber">
            <div className="flex items-center justify-between px-3 py-2 border-b border-umber bg-surface">
              <div className="label text-cream">TRADES · {result?.trades?.length ?? 0}</div>
              <div className="label text-muted2">PAPER TRADING ONLY — NOT INVESTMENT ADVICE</div>
            </div>
            <div className="max-h-72 overflow-y-auto thin-scroll">
              <table className="w-full text-[11px] font-mono zebra" data-testid="forge-trades">
                <thead>
                  <tr className="text-muted2">
                    {["#","ENTRY","EXIT","SIDE","QTY","PNL","RET%"].map(h => <th key={h} className="text-left px-3 py-2">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(result.trades || []).slice(0, 200).map((t, i) => (
                    <tr key={i} className="border-t border-umber/60">
                      <td className="px-3 py-1 text-muted2">{i + 1}</td>
                      <td className="px-3 py-1">{fmt(t.entry_date || t.entry)}</td>
                      <td className="px-3 py-1">{fmt(t.exit_date || t.exit)}</td>
                      <td className="px-3 py-1 text-volt">{(t.side || "LONG").toUpperCase()}</td>
                      <td className="px-3 py-1">{t.qty ?? t.size ?? "—"}</td>
                      <td className={"px-3 py-1 " + ((t.pnl ?? 0) >= 0 ? "text-volt" : "text-[#ff8a8a]")}>{fmtN(t.pnl)}</td>
                      <td className={"px-3 py-1 " + ((t.return ?? 0) >= 0 ? "text-volt" : "text-[#ff8a8a]")}>{fmtN(t.return_pct ?? t.return)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="mb-3">
      <div className="label text-muted2 mb-1">{label}</div>
      {children}
    </div>
  );
}
function MetricCard({ label, v, suffix = "", decimals = 2 }) {
  const val = Number.isFinite(+v) ? +v : 0;
  return (
    <div className="volt-frame p-4 bg-surface">
      <div className="label text-sepia">{label}</div>
      <div className="text-gold text-4xl font-display italic mt-1"><Odometer value={val} decimals={decimals} suffix={suffix} /></div>
    </div>
  );
}
function fmt(v){ if(!v) return "—"; try { return new Date(v).toISOString().slice(0,10); } catch { return String(v); } }
function fmtN(v){ if(v==null||!Number.isFinite(+v)) return "—"; const n=+v; return (n>=0?"+":"")+n.toFixed(2); }
