export function Card({ className="", children }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-soft ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 to-accent-600" />
      {children}
    </div>
  );
}
export function CardHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between gap-4 p-5 border-b border-zinc-200/70">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
export function CardBody({ className="", children }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
