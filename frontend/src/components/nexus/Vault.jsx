import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { PAINTINGS } from "../../lib/paintings";

export default function Vault({ onLoadToForge, refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/api/strategies");
      setItems(Array.isArray(data) ? data : (data?.items || []));
    } catch { setItems([]); }
  };
  useEffect(() => { load(); }, [refreshKey]);

  const remove = async (id) => {
    try { await api.delete(`/api/strategies/${id}`); await load(); setMsg("REMOVED"); }
    catch (e) { setMsg(`✗ ${e?.message}`); }
  };

  return (
    <section id="s4" className="section paper-tex text-ink relative" data-testid="section-vault">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(107,74,43,0.14), transparent 60%)" }} />
      <div className="relative z-10 pt-24 pb-6 px-8 md:px-16 flex items-end justify-between">
        <div>
          <div className="label text-umber">S/04</div>
          <h2 className="display-lg text-ink mt-3">
            The <span className="italic-swash text-umber">Vault</span>
          </h2>
          <div className="orn text-umber/80 mt-4"><span className="italic-swash text-lg font-display normal-case tracking-normal">A gallery of survivors.</span></div>
          <div className="label text-umber/80 mt-3 max-w-lg tracking-[0.22em]">EVERY PLAQUE REMEMBERS ITS AUTHOR.</div>
        </div>
        <button onClick={load} className="btn-ghost text-ink border-umber" data-cursor="refresh" data-testid="vault-refresh">REFRESH</button>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-8 md:px-16 pb-24" data-testid="vault-grid">
        {items.length === 0 && (
          <div className="col-span-full py-16 text-center label text-umber">— NO STRATEGIES YET · FORGE OR SUMMON —</div>
        )}
        {items.map((s, i) => {
          const p = PAINTINGS[i % PAINTINGS.length].url;
          const id = s.id || s._id;
          const m = s.metrics || {};
          return (
            <div key={id || i} className="bg-ink text-cream border border-umber flex flex-col" data-testid={`vault-item-${i}`}>
              <div className="painting-frame m-2" style={{ aspectRatio: "4/3" }}>
                <div className="relative w-full h-full overflow-hidden">
                  <img src={p} alt="" className="w-full h-full object-cover opacity-90" />
                  <div className="absolute inset-0 scanlines opacity-40" />
                </div>
              </div>
              <div className="p-4">
                <div className="label text-volt">№{String(i + 1).padStart(2, "0")} · {(s.symbol || "—").toUpperCase()}</div>
                <div className="font-display text-xl text-cream leading-tight mt-1 line-clamp-1">{s.name || "UNTITLED"}</div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <MiniStat label="SHARPE" v={m.sharpe ?? m.Sharpe} />
                  <MiniStat label="CAGR%" v={m.cagr ?? m.CAGR} />
                  <MiniStat label="DD%"  v={m.max_dd ?? m.maxDD} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-ghost" onClick={() => onLoadToForge?.(s.code)} data-cursor="load" data-testid={`vault-load-${i}`}>LOAD</button>
                  <button className="btn-ghost" onClick={() => onLoadToForge?.(s.code, true)} data-cursor="run" data-testid={`vault-run-${i}`}>RUN AGAIN</button>
                  <button className="btn-ghost" onClick={() => remove(id)} data-cursor="delete" data-testid={`vault-delete-${i}`}>DELETE</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {msg && <div className="absolute bottom-4 right-8 label text-umber z-10">{msg}</div>}
    </section>
  );
}

function MiniStat({ label, v }) {
  const val = Number.isFinite(+v) ? (+v).toFixed(2) : "—";
  return (
    <div className="border-[0.5px] border-umber/40 p-2">
      <div className="label text-umber/70 text-[9px]">{label}</div>
      <div className="text-ink font-display italic text-lg">{val}</div>
    </div>
  );
}
