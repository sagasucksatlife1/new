# GD Nexus — Product Requirements Document

## Original Problem Statement
A single-page React app called **GD NEXUS**, a private research terminal that fuses an AI strategy lab (10 LLM personas), a backtesting engine (QuantForge), and a portfolio optimizer (QuantPort). Frontend-only — talks to an existing external FastAPI backend via `REACT_APP_API_BASE` (Cloudflare tunnel URL supplied later by the user). Passphrase login (`nexus`) → JWT bearer token.

Aesthetic — v3 (user-directed, final):
plain white paper, black ink, one serif (Fraunces), no colour anywhere, no custom cursor, no animation, no imagery. Copy in extreme financial / Queen's English. The visitor should feel out of place. Three functional pages: **LLM (Council)**, **Testing (Forge)**, **Portfolio (Treasury)** — with a title page as an editorial preface.

## Architecture
- **Frontend**: CRA + craco, React 19, TailwindCSS, `react-router-dom` v7 for multi-page routing.
- Monaco Editor (paper-white theme, italic keywords, no colour) for the Forge.
- Axios client (`/app/frontend/src/lib/api.js`) with `Authorization: Bearer <token>`. On any 401 the user is dropped to the gate.
- EventSource for SSE stream `/api/lab/run/stream`; token appended as query param since EventSource cannot carry auth headers reliably.
- Backend is **external** (`REACT_APP_API_BASE`, default `http://localhost:8000`). Not implemented in this repo.

## Design System (v3 — final)
- Font: **Fraunces** (opsz + swash). No secondary family; no monospace.
- Palette: `#ffffff` paper, `#111111` ink, `#6a6a6a` muted, `#d8d0c2` hairline rule. Nothing else.
- Links: underlined black, hover removes underline. All buttons are bordered `1px solid #111` or `.btn-link` (underlined text).
- Standard cursor everywhere. No custom cursor, no smooth-scroll library, no GSAP, no Lenis.

## Sitemap
- `/` — **Preface** (title-page TOC in the manner of an academic broadsheet, health check listed as prose).
- `/lab` — **Chapter I · The Council** (personas, SSE console, graveyard, survivors table with Save/Open-in-Forge actions).
- `/backtest` — **Chapter II · The Forge** (Monaco editor + configuration + results + trades + inline Vault of saved strategies).
- `/portfolio` — **Chapter III · The Treasury** (holdings editor, analyse, MVO/HRP optimise with weight bars, fusion back-test).
- Access gate before all pages; wrong passphrase shows italic error.

## API Contract (unchanged from spec)
- `POST /api/auth/login {password} → {token}`
- `GET /api/health`, `GET /api/personas`
- `POST /api/lab/run` + SSE at `GET /api/lab/run/stream?run_id=&token=`
- `POST /api/backtest/validate`, `POST /api/backtest`
- `GET/POST /api/strategies`, `DELETE /api/strategies/{id}`
- `POST /api/portfolio/analyze`, `POST /api/portfolio/optimize`, `POST /api/portfolio/backtest`

## Environment
- `REACT_APP_API_BASE` — swap to Cloudflare tunnel URL when ready. Defaults to `http://localhost:8000`.
- `REACT_APP_BACKEND_URL` — kept for compatibility with emergent template.

## What's Been Implemented (2026-02, v3)
- Plain-paper aesthetic, one serif, no colour, no fancy cursor.
- Access gate → JWT token → localStorage. 401 handling drops back to gate.
- Home page — preface, table of contents, method paragraph, machine health as prose.
- Lab page — persona roster table, SSE console feed, graveyard with collapsible failed code, survivors table with Save-to-Vault and Open-in-Forge.
- Backtest page — Monaco editor (paper theme), full configuration, equity + drawdown figures, metrics stats, trades table, and inline Vault of saved strategies with Load/Delete.
- Portfolio page — holdings editor, sum-to-100% indicator, analyse, MVO/HRP optimise with before/after weight bars and delta metrics, Fusion back-test.
- Consistent top nav across all authenticated pages with underlined chapter links + logout.

## Deviations from Spec
- Spec asked for `import.meta.env.VITE_API_BASE` (Vite). Template is CRA — same runtime intent via `process.env.REACT_APP_API_BASE`.
- All the ornate GSAP/Lenis/glitch/scan-line/painting/dome effects from v1 and v2 are intentionally **removed** at the user's explicit request for a plain broadsheet look. Files still exist on disk (Cursor.jsx, SmoothScroll.jsx, PaintingFrame.jsx, WireframeDome.jsx, MagneticButton.jsx, Odometer.jsx, TopBar.jsx, Hero.jsx, Council.jsx, Forge.jsx, Vault.jsx, Treasury.jsx, Epilogue.jsx) but are **no longer imported by App.js**. Safe to delete when convenient.

## Backlog
- **P0** — Verify end-to-end against live FastAPI once Cloudflare tunnel URL is supplied (login, personas, SSE, backtest, strategies CRUD, portfolio analyze/optimize/backtest).
- **P1** — Optional keyboard-driven navigation (e.g. `g h`, `g l`, `g f`, `g t` to jump chapters, in the manner of a terminal).
- **P2** — Printable / PDF stylesheet so any chapter can be exported as a research note.
- **P2** — Small "cite this run" export that captures a survivor's metrics + code into a plain typographic plate.
