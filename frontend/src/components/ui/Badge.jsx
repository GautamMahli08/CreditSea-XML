export default function Button({ as:Comp="button", variant="primary", className="", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-300/50";
  const styles = {
    primary: "text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-95 shadow-card",
    ghost: "bg-white/70 backdrop-blur border border-zinc-200 hover:bg-white shadow-soft",
    subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100"
  };
  return <Comp className={`${base} ${styles[variant]} ${className}`} {...props}>{children}</Comp>;
}
