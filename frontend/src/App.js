import { useEffect, useRef, useState } from "react";
import "./App.css";
import { getToken, setUnauthHandler, clearToken } from "./lib/api";
import SmoothScroll from "./components/nexus/SmoothScroll";
import Cursor from "./components/nexus/Cursor";
import AccessGate from "./components/nexus/AccessGate";
import TopBar from "./components/nexus/TopBar";
import Hero from "./components/nexus/Hero";
import Council from "./components/nexus/Council";
import Forge from "./components/nexus/Forge";
import Vault from "./components/nexus/Vault";
import Treasury from "./components/nexus/Treasury";
import Epilogue from "./components/nexus/Epilogue";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [forgeCode, setForgeCode] = useState(null);
  const [vaultBump, setVaultBump] = useState(0);
  const forgeRef = useRef(null);

  useEffect(() => {
    setUnauthHandler(() => setAuthed(false));
    document.title = "GD NEXUS · STRATEGY / CAPITAL / MACHINE";
  }, []);

  const logout = () => { clearToken(); setAuthed(false); };
  const loopBack = () => {
    const el = document.getElementById("s1");
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.6 });
    else el?.scrollIntoView({ behavior: "smooth" });
  };

  const openInForge = (code, autoJump = true) => {
    setForgeCode(code);
    if (autoJump) {
      setTimeout(() => {
        const el = document.getElementById("s3");
        if (window.__lenis && el) window.__lenis.scrollTo(el, { offset: -20, duration: 1.2 });
        else el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Auto-loop when user reaches epilogue bottom
  useEffect(() => {
    if (!authed) return;
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight;
      const h = document.body.scrollHeight;
      if (y >= h - 4 && Date.now() - last > 2000) {
        last = Date.now();
        loopBack();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [authed]);

  if (!authed) {
    return (
      <>
        <Cursor />
        <AccessGate onAuth={() => setAuthed(true)} />
      </>
    );
  }

  return (
    <SmoothScroll>
      <Cursor />
      <TopBar onLogout={logout} />
      <main className="relative">
        <Hero />
        <Council onOpenInForge={openInForge} />
        <div ref={forgeRef}>
          <Forge initialCode={forgeCode} onSavedToVault={() => setVaultBump((v) => v + 1)} />
        </div>
        <Vault onLoadToForge={openInForge} refreshKey={vaultBump} />
        <Treasury />
        <Epilogue onLoop={loopBack} />
      </main>

      {/* SVG glitch filter (used on paintings via filter: url(#glitch)) */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="glitch">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
          <feOffset in="SourceGraphic" dx="-3" dy="0" result="r" />
          <feOffset in="SourceGraphic" dx="3" dy="0" result="b" />
          <feBlend in="r" in2="b" mode="screen" />
        </filter>
      </svg>
    </SmoothScroll>
  );
}
