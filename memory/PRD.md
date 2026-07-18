# GD NEXUS — Product Requirements Document

## Original Problem Statement
A single-page React app called **GD NEXUS**, a unified quant research terminal fusing an AI strategy lab (10 LLM personas), a backtesting engine (QuantForge), and a portfolio optimizer (QuantPort). Frontend-only — talks to an existing external FastAPI backend via `REACT_APP_API_BASE` (Cloudflare tunnel URL supplied later by the user).

Aesthetic pivot (v2, user-directed): drop the F1-neon-volt look and go **full "Old Masters / museum book"** — warm oil-painting palette, editorial serif with italic swashes (Fraunces), full-bleed painting canvases with oversized italic overlays (Silent Beauty / Timeless Art reference).

## Users
- Solo quant researcher exploring LLM-generated strategies against public markets.
- Portfolio manager stress-testing holdings via MVO / HRP.
- Access is single-passphrase (`nexus`); backend issues JWT.

## Architecture
- **Frontend**: CRA + craco (existing template), React 19, TailwindCSS.
  - GSAP + ScrollTrigger for scroll-linked animation.
  - Lenis for smooth scrolling.
  - Monaco Editor for Python signals code.
  - Axios client with `Authorization: Bearer <token>`; global 401 handler drops user back to the gate.
  - EventSource for `/api/lab/run/stream` (token appended as query param since EventSource can't carry headers reliably).
- **Backend**: external FastAPI at `REACT_APP_API_BASE` (default `http://localhost:8000`). Not implemented in this repo.
- **Fonts**: `Fraunces` (serif + italic swash) and `Cormorant Garamond` fallback.
- **Painting imagery**: The Met Museum Open Access (`images.metmuseum.org`) — proper CORS, no ORB issues. 12 curated Rembrandt/Caravaggio/Vermeer-era portraits.

## Palette (v2 — warm oil painting)
- canvas / ink   `#1B140D`
- surface        `#241A11`
- parchment/cream `#E7DAB8`
- umber          `#6B4A2B`
- olive/moss     `#4A5A3A`
- **antique gold** (accent, replaces neon volt) `#C9A567`
- burnt sienna   `#8B3A2E`
- sepia          `#B99366`

## What's Been Implemented (2026-02)
- **Access Gate** — full-bleed Rembrandt painting with drift, cream placard, "The gallery is closed." editorial copy, italic serif input, `POST /api/auth/login` → JWT stored in localStorage. Wrong pw → painting shake glitch.
- **S1 Hero** — full-bleed painting, oversized italic "Timeless Strategy", "Presenting" ornament, live status chips (backend/ollama/data), IST clock in nav.
- **S2 The Council** — 10 persona portrait cards (horizontal scroll), pit-wall controls (symbol, period, timeframe), magnetic "Summon the Council" button, live SSE console + Graveyard (collapsible failed code) + Survivor cards with metric odometers, save-to-vault / open-in-forge actions.
- **S3 The Forge** — Monaco editor (warm gold syntax on canvas), full run-config panel (chips/slider/inputs), validate/run/save buttons, equity + benchmark SVG chart, drawdown chart, animated metric cards, trades table.
- **S4 The Vault** — parchment gallery wall, gold-framed strategy plaques, load/run/delete.
- **S5 The Treasury** — holdings editor with sum-to-100% gold progress bar, engraved correlation heatmap (warm gold ↔ burnt), MVO/HRP optimizer with before/after morphing weight bars, **Fusion** backtest (pick vault strategy + run over portfolio).
- **S6 Epilogue** — full-bleed painting, gigantic italic "The market is a museum. Everything here has happened before.", return-to-beginning button, auto-loop back to S1 when user scrolls past the bottom.
- **Global**: fixed top-left wordmark, top-right logout + live IST clock, custom warm-gold cursor with trailing ring + contextual labels, Lenis smooth scroll, `data-testid` on all interactive elements.

## Environment
- `REACT_APP_API_BASE` — swap to Cloudflare tunnel URL of the FastAPI backend when ready. Defaults to `http://localhost:8000`.
- `REACT_APP_BACKEND_URL` — kept for compatibility with emergent template.

## Deviations from Spec
- Spec asked for `import.meta.env.VITE_API_BASE` (Vite). This template is CRA — we honour the intent via `process.env.REACT_APP_API_BASE`. Runtime behaviour identical.
- Spec asked for JetBrains Mono for data labels + Playfair Display for headings. User-directed v2 pivot: everything now uses Fraunces (with italic swashes) and Cormorant Garamond fallback — no monospaced UI text.
- Wikimedia thumbs were blocked by Chrome ORB from the preview origin; we use The Met Museum Open Access instead. Same public-domain classical portraits.

## Backlog (P0 / P1 / P2)
- **P0** — Verify against live FastAPI once tunnel URL is provided (auth, personas, SSE, backtest, portfolio endpoints).
- **P1** — GSAP ScrollTrigger horizontal pin on S2 Council for the classic "pinned scroll" feel on desktop.
- **P1** — Character-by-character text-mask reveal on section titles.
- **P1** — Ink-brush SVG shutter wipes between sections.
- **P2** — Painting hover: RGB-split + pixel-sort filter (SVG feDisplacement + turbulence).
- **P2** — Odometer flip-clock digit rolls (currently interpolated numbers).
