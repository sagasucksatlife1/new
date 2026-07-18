import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import "./App.css";
import { getToken, setUnauthHandler, clearToken } from "./lib/api";
import AccessGate from "./components/nexus/AccessGate";
import HomePage from "./components/nexus/HomePage";
import LabPage from "./components/nexus/LabPage";
import BacktestPage from "./components/nexus/BacktestPage";
import PortfolioPage from "./components/nexus/PortfolioPage";

function Chrome({ children, onLogout }) {
  const loc = useLocation();
  const items = [
    ["/", "Introduction"],
    ["/lab", "I. The Council"],
    ["/backtest", "II. The Forge"],
    ["/portfolio", "III. The Treasury"],
  ];
  return (
    <div>
      <header className="border-b border-[#111] bg-white sticky top-0 z-40">
        <div className="container-wide !pt-4 !pb-4 !pl-6 !pr-6 flex items-center justify-between flex-wrap gap-4">
          <Link to="/" className="no-underline hover:no-underline" data-testid="brand">
            <span className="font-display text-lg tracking-wide">GD Nexus</span>
            <span className="muted italic ml-3 small">— A Terminal for Quantitative Research</span>
          </Link>
          <nav className="flex items-center gap-6 small flex-wrap" data-testid="top-nav">
            {items.map(([p, l]) => (
              <Link
                key={p}
                to={p}
                data-testid={`nav-${p === "/" ? "home" : p.replace("/","")}`}
                className={loc.pathname === p ? "no-underline italic" : ""}
              >
                {l}
              </Link>
            ))}
            <button className="btn-link small" onClick={onLogout} data-testid="logout-btn">Logout</button>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-[#111] mt-24">
        <div className="container-wide !pt-8 !pb-8 !pl-6 !pr-6 flex items-center justify-between small muted flex-wrap gap-2">
          <div>GD Nexus · MMXXVI · Paper trading only. Not investment advice.</div>
          <div className="italic">Herewith, our situational awareness.</div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  useEffect(() => {
    setUnauthHandler(() => setAuthed(false));
    document.title = "GD Nexus";
  }, []);
  const logout = () => { clearToken(); setAuthed(false); };

  if (!authed) return <AccessGate onAuth={() => setAuthed(true)} />;

  return (
    <BrowserRouter>
      <Chrome onLogout={logout}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lab" element={<LabPage />} />
          <Route path="/backtest" element={<BacktestPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Chrome>
    </BrowserRouter>
  );
}
