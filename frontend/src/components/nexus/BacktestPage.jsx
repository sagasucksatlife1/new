import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { api } from "../../lib/api";
import EquityChart from "./EquityChart";

const DEFAULT_CODE = `# GD Nexus · Forge · Signals Contract
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

export default function BacktestPage() {
  const initial = useMemo(() => {
    try { return sessionStorage.getItem("gd_nexus_forge_code") || DEFAULT_CODE; }
    catch { return DEFAULT_CODE; }
  }, []);
  useEffect(() => { try { sessionStorage.removeItem("gd_nexus_forge_code"); } catch {} }, []);

  const [code, setCode] = useState(initial);
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

  // saved strategies (vault)
  const [vault, setVault] = useState([]);
  const loadVault = async () => {
    try {
      const { data } = await api.get("/api/strategies");
      setVault(Array.isArray(data) ? data : (data?.items || []));
    } catch { setVault([]); }
  };
  useEffect(() => { loadVault(); }, []);

  const validate = async () => {
    setBusy(true); setMsg("Validating…");
    try {
      const { data } = await api.post("/api/backtest/validate", { code });
      setMsg(data?.valid ? "Contract accepted." : `Rejected — ${data?.error || "invalid"}`);
    } catch (e) { setMsg(`Failure — ${e?.message || "terminal offline"}`); }
    finally { setBusy(false); }
  };
  const run = async () => {
    setBusy(true); setMsg("Running back-test…"); setResult(null);
    try {
      const { data } = await api.post("/api/backtest", {
        code, symbol, period, interval,
        capital: Number(capital), cost_bps: Number(cost),
        leverage: Number(leverage), stop_loss: Number(sl), take_profit: Number(tp),
      });
      setResult(data);
      setMsg(`Back-test complete — ${(data?.trades?.length || 0)} trades recorded.`);
    } catch (e) { setMsg(`Failure — ${e?.response?.data?.detail || e?.message || "terminal offline"}`); }
    finally { setBusy(false); }
  };
  const save = async () => {
    try {
      await api.post("/api/strategies", {
        name: `Forge · ${symbol} · ${new Date().toISOString().slice(0, 10)}`,
        code, symbol, metrics: result?.metrics || null,
      });
      setMsg("Committed to the vault.");
      await loadVault();
    } catch (e) { setMsg(`Save failed — ${e?.message}`); }
  };
  const removeStrategy = async (id) => {
    try { await api.delete(`/api/strategies/${id}`); await loadVault(); }
    catch (e) { setMsg(`Delete failed — ${e?.message}`); }
  };
  const loadStrategy = (s) => { setCode(s.code || DEFAULT_CODE); setSymbol(s.symbol || symbol); setMsg(`Loaded — ${s.name}`); };

  const m = result?.metrics || {};

  return (
    <div className="container-wide">
      <div>
        <div className="small muted italic">Chapter II</div>
        <h1 className="mt-1">The Forge</h1>
        <p className="italic muted mt-2">A laboratory in which strategies are hand-cut and hammered against the historical record.</p>
      </div>

      <div className="rule mt-8" />

      <section className="section-gap prose max-w-none">
        <p>
          The signals contract is elementary: a function <span className="italic">generate_signals(df)</span>
          that returns a pandas <span className="italic">Series</span> in {"{"}+1, 0, −1{"}"} aligned to the OHLCV index.
          The forge is otherwise silent about how one arrives at those numbers.
        </p>
      </section>

      {/* Editor + Config */}
      <section className="section-gap grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="border-t border-b border-[#111]">
            <div className="flex items-center justify-between px-1 py-2 border-b border-[#d8d0c2] small muted">
              <span>generate_signals.py</span>
              <span className="italic">{msg}</span>
            </div>
            <div style={{ height: 420 }} data-testid="forge-editor">
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(v) => setCode(v || "")}
                theme="vs"
                options={{
                  fontFamily: "'Fraunces', 'Times New Roman', serif",
                  fontSize: 15, minimap: { enabled: false }, scrollBeyondLastLine: false,
                  cursorBlinking: "solid", renderLineHighlight: "none",
                  lineNumbersMinChars: 3, padding: { top: 10, bottom: 10 },
                }}
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme("nexus-paper", {
                    base: "vs", inherit: true,
                    rules: [
                      { token: "keyword", foreground: "111111", fontStyle: "italic" },
                      { token: "string", foreground: "444444" },
                      { token: "number", foreground: "111111" },
                      { token: "comment", foreground: "888888", fontStyle: "italic" },
                    ],
                    colors: {
                      "editor.background": "#ffffff",
                      "editor.foreground": "#111111",
                      "editorLineNumber.foreground": "#aaaaaa",
                      "editorCursor.foreground": "#111111",
                      "editor.selectionBackground": "#e6e0d0",
                    },
                  });
                  monaco.editor.setTheme("nexus-paper");
                }}
                onMount={(_e, monaco) => monaco.editor.setTheme("nexus-paper")}
              />
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <h3>Configuration</h3>
          <div className="mt-4 space-y-4">
            <Field label="Symbol">
              <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} data-testid="forge-symbol" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Period"><select value={period} onChange={(e) => setPeriod(e.target.value)} data-testid="forge-period">{PERIODS.map(p => <option key={p}>{p}</option>)}</select></Field>
              <Field label="Interval"><select value={interval} onChange={(e) => setIntv(e.target.value)} data-testid="forge-interval">{TFS.map(t => <option key={t}>{t}</option>)}</select></Field>
            </div>
            <Field label={`Leverage — ${leverage}×`}>
              <input type="range" min={1} max={10} step={1} value={leverage} onChange={(e) => setLev(+e.target.value)} data-testid="forge-leverage" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cost (bps)"><input type="number" value={cost} onChange={(e) => setCost(e.target.value)} data-testid="forge-cost" /></Field>
              <Field label="Capital (₹)"><input type="number" value={capital} onChange={(e) => setCap(e.target.value)} data-testid="forge-capital" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Stop-loss %"><input type="number" value={sl} onChange={(e) => setSL(e.target.value)} data-testid="forge-sl" /></Field>
              <Field label="Take-profit %"><input type="number" value={tp} onChange={(e) => setTP(e.target.value)} data-testid="forge-tp" /></Field>
            </div>
            <div className="flex gap-3 pt-2 flex-wrap">
              <button className="btn" onClick={validate} disabled={busy} data-testid="forge-validate">Validate</button>
              <button className="btn" onClick={run} disabled={busy} data-testid="forge-run">Run</button>
              <button className="btn" onClick={save} disabled={!result} data-testid="forge-save">Save to vault</button>
            </div>
          </div>
        </aside>
      </section>

      {/* Results */}
      {result && (
        <section className="section-gap" data-testid="forge-results">
          <h3>Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <Stat label="CAGR" v={m.cagr ?? m.CAGR} suf="%" />
            <Stat label="Sharpe" v={m.sharpe ?? m.Sharpe} />
            <Stat label="Max DD" v={m.max_dd ?? m.maxDD} suf="%" />
            <Stat label="Win rate" v={m.win_rate ?? m.winRate} suf="%" />
            <Stat label="Trades" v={m.trades ?? result?.trades?.length ?? 0} d={0} />
          </div>

          <div className="mt-8 figure">
            <EquityChart equity={result.equity || []} benchmark={result.benchmark || []} testid="forge-equity" />
            <div className="figure-caption italic">
              Figure 1. Strategy equity (heavier line) against buy-and-hold benchmark (lighter line).
            </div>
          </div>

          {(result.drawdown || []).length > 0 && (
            <div className="mt-6 figure">
              <EquityChart equity={result.drawdown || []} benchmark={[]} height={90} testid="forge-drawdown" />
              <div className="figure-caption italic">Figure 2. Drawdown series.</div>
            </div>
          )}

          <h3 className="mt-10">Trades — {result?.trades?.length ?? 0}</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="plain-table" data-testid="forge-trades">
              <thead>
                <tr><th>№</th><th>Entry</th><th>Exit</th><th>Side</th><th>Qty</th><th>P&amp;L</th><th>Ret %</th></tr>
              </thead>
              <tbody>
                {(result.trades || []).slice(0, 200).map((t, i) => (
                  <tr key={i}>
                    <td className="muted italic">{i + 1}.</td>
                    <td>{fmt(t.entry_date || t.entry)}</td>
                    <td>{fmt(t.exit_date || t.exit)}</td>
                    <td className="italic">{(t.side || "long")}</td>
                    <td>{t.qty ?? t.size ?? "—"}</td>
                    <td>{fmtSigned(t.pnl)}</td>
                    <td>{fmtSigned(t.return_pct ?? t.return)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Vault */}
      <section className="section-gap">
        <div className="flex items-baseline justify-between">
          <h3>The Vault — {vault.length}</h3>
          <button className="btn-link small" onClick={loadVault} data-testid="vault-refresh">Refresh</button>
        </div>
        {vault.length === 0 ? (
          <div className="italic muted small mt-2">No strategies committed yet.</div>
        ) : (
          <table className="plain-table mt-4" data-testid="vault-table">
            <thead>
              <tr><th>№</th><th>Name</th><th>Symbol</th><th>Sharpe</th><th>CAGR%</th><th>Max DD%</th><th></th></tr>
            </thead>
            <tbody>
              {vault.map((s, i) => {
                const id = s.id || s._id;
                const mm = s.metrics || {};
                return (
                  <tr key={id || i} data-testid={`vault-item-${i}`}>
                    <td className="muted italic">{i + 1}.</td>
                    <td className="italic">{s.name || "Untitled"}</td>
                    <td>{s.symbol || "—"}</td>
                    <td>{fmtN(mm.sharpe ?? mm.Sharpe)}</td>
                    <td>{fmtN(mm.cagr ?? mm.CAGR)}</td>
                    <td>{fmtN(mm.max_dd ?? mm.maxDD)}</td>
                    <td className="small">
                      <button className="btn-link" onClick={() => loadStrategy(s)} data-testid={`vault-load-${i}`}>Load</button>{" · "}
                      <button className="btn-link" onClick={() => removeStrategy(id)} data-testid={`vault-delete-${i}`}>Delete</button>
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
        Return to <Link to="/lab">the Council</Link> for a fresh summons, or proceed to <Link to="/portfolio">the Treasury</Link>.
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (<div><div className="small muted">{label}</div>{children}</div>);
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
function fmtN(v) { return Number.isFinite(+v) ? (+v).toFixed(2) : "—"; }
function fmtSigned(v) { if (!Number.isFinite(+v)) return "—"; const n = +v; return (n >= 0 ? "+" : "") + n.toFixed(2); }
function fmt(v) { if (!v) return "—"; try { return new Date(v).toISOString().slice(0, 10); } catch { return String(v); } }
