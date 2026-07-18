export default function PaintingFrame({ src, alt = "", className = "", overlay = null, aspect = "3/4" }) {
  return (
    <div className={`painting-frame ${className}`} style={{ aspectRatio: aspect }}>
      <div className="relative w-full h-full overflow-hidden">
        <img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" style={{ filter: "saturate(0.95) contrast(1.03)" }} />
        {overlay}
      </div>
    </div>
  );
}
