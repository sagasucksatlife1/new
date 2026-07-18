export default function StatusChip({ label, status = "wait", testid }) {
  const cls = status === "ok" ? "dot ok" : status === "err" ? "dot err" : "dot wait";
  return (
    <div className="flex items-center gap-2" data-testid={testid}>
      <span className={cls} />
      <span className="font-display italic text-[12px] tracking-[0.22em] uppercase text-cream/85">{label}</span>
    </div>
  );
}
