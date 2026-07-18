import { PAINTINGS } from "../../lib/paintings";

export default function Epilogue({ onLoop }) {
  const painting = PAINTINGS[7]; // Van Gogh self-portrait, atmospheric closing
  return (
    <section id="s6" className="section bg-canvas text-cream flex items-center justify-center" data-testid="section-epilogue">
      <div className="painting-hero drift" style={{ backgroundImage: `url(${painting.url})`, opacity: 0.35 }} />
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(27,20,13,0.4) 0%, rgba(27,20,13,0.95) 80%)" }} />
      <div className="relative z-10 max-w-5xl px-8 text-center">
        <div className="orn text-sepia mb-8"><span className="italic-swash text-lg font-display normal-case tracking-normal">Epilogue</span></div>
        <div className="display-lg text-cream leading-[1.02]">
          The market is a <span className="italic-swash text-gold">museum.</span>
        </div>
        <div className="display-md text-cream/85 mt-6 italic-swash leading-[1.05]">
          Everything here has happened before.
        </div>
        <div className="mt-16 flex flex-col items-center gap-6">
          <button
            onClick={onLoop}
            className="btn-volt"
            data-cursor="loop"
            data-testid="epilogue-loop"
          >
            ↻ Return to the beginning
          </button>
          <div className="label text-cream/60 tracking-[0.32em]">GD · THRIVEITI · MMXXVI</div>
          <div className="label text-cream/50 tracking-[0.24em]">Paper trading only — not investment advice</div>
        </div>
      </div>
    </section>
  );
}
