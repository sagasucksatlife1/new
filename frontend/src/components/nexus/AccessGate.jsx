import { useState } from "react";
import { api, setToken } from "../../lib/api";

export default function AccessGate({ onAuth }) {
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!pwd || busy) return;
    setBusy(true); setErr("");
    try {
      const { data } = await api.post("/api/auth/login", { password: pwd });
      const token = data?.token;
      if (!token) throw new Error("No token");
      setToken(token);
      onAuth?.(token);
    } catch (ex) {
      setErr(ex?.response?.status === 401 ? "The passphrase is incorrect." : "The terminal cannot be reached.");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-white text-ink flex items-center justify-center" data-testid="access-gate">
      <div className="w-full max-w-lg px-6">
        <div className="text-center">
          <h1 className="font-display" style={{ fontSize: "clamp(40px, 6vw, 68px)", lineHeight: 1.05 }}>
            GD Nexus
          </h1>
          <div className="muted italic mt-2 small">A Terminal for Quantitative Research · MMXXVI</div>
        </div>

        <div className="rule mt-10" />

        <form onSubmit={submit} className="mt-10" data-testid="gate-form">
          <div className="small muted italic mb-6 text-center">
            The terminal is by invitation. Kindly enter your passphrase to proceed.
          </div>
          <div className="mx-auto max-w-sm">
            <label className="small muted block mb-1">Passphrase</label>
            <input
              autoFocus
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              data-testid="gate-input"
              placeholder="········"
            />
            <div className="mt-8 flex items-center justify-between">
              <button type="submit" className="btn" disabled={busy || !pwd} data-testid="gate-submit">
                {busy ? "Verifying…" : "Enter"}
              </button>
              {err && <div className="italic small" style={{ color: "#7a1e12" }} data-testid="gate-error">{err}</div>}
            </div>
          </div>
        </form>

        <div className="rule-thin mt-16" />
        <div className="small muted text-center mt-6 italic">
          No sign-up. No username. Only those who know the word may pass.
        </div>
      </div>
    </div>
  );
}
