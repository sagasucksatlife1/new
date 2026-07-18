import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

export default function HomePage() {
  const [h, setH] = useState({ status: "…", ollama: "…", data: "…" });
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const { data } = await api.get("/api/health");
        if (stop) return;
        setH({
          status: (data?.status === "ok" || data?.status === "healthy") ? "connected" : "down",
          ollama: (data?.ollama === true || data?.ollama === "ok" || data?.ollama === "up") ? "connected" : "down",
          data: (data?.data === true || data?.data === "ok" || data?.data === "up") ? "connected" : "down",
        });
      } catch { if (!stop) setH({ status: "down", ollama: "down", data: "down" }); }
    })();
    return () => { stop = true; };
  }, []);

  return (
    <div className="container-narrow">
      <div className="text-center">
        <h1 className="font-display" style={{ fontSize: "clamp(56px, 8vw, 96px)", lineHeight: 1 }}>GD Nexus</h1>
        <div className="muted italic mt-3">A Terminal for Quantitative Research</div>
      </div>

      <div className="rule mt-14" />

      <nav className="mt-8 text-center small" data-testid="toc-nav">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <Link to="/lab">I. The Council — an assembly of ten synthetic minds</Link>
          <Link to="/backtest">II. The Forge — a laboratory for signals</Link>
          <Link to="/portfolio">III. The Treasury — a rebalancing of the estate</Link>
        </div>
      </nav>

      <div className="rule-thin mt-14" />

      <section className="prose mt-14" data-testid="home-about">
        <h2>Preface</h2>
        <p>
          GD Nexus is a private research terminal. It is, in essence, three instruments
          bound in a single volume: a council of language-model personas that propose
          strategies; a forge in which those strategies are hand-cut and tested against
          the historical record; and a treasury that composes those strategies into a
          portfolio and rebalances the estate.
        </p>
        <p>
          The apparatus is technical, but the discipline is old. Nothing that happens
          here has not happened before — the markets, like galleries, are
          principally a museum of what has already been done.
        </p>

        <h2>Method</h2>
        <p>
          Each session begins in the <Link to="/lab">Council</Link>, where personas are
          summoned against a symbol and a period. Their proposals are validated,
          back-tested, and — where the numbers permit — framed. The surviving code
          may be forwarded to the <Link to="/backtest">Forge</Link> for further
          refinement, or committed directly to the vault of accepted strategies.
        </p>
        <p>
          The <Link to="/portfolio">Treasury</Link> assembles those instruments into a
          weighted holding, analyses their correlations, optimises the composition by
          Mean-Variance or Hierarchical-Risk-Parity, and — should the operator wish —
          applies a chosen strategy to the combined equity curve.
        </p>

        <h2>Provenance of the machine</h2>
        <p>
          The terminal talks to an external service. Its state, at the present moment,
          is as follows:
        </p>
        <ul>
          <li>Backend — <span className="italic">{h.status}</span></li>
          <li>Ollama — <span className="italic">{h.ollama}</span></li>
          <li>Market data — <span className="italic">{h.data}</span></li>
        </ul>

        <blockquote>
          Paper trading only. Nothing herein is investment advice.
        </blockquote>
      </section>
    </div>
  );
}
