export default function Button({ as:Comp="button", variant="primary", className="", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-black/10";
  const styles = {
    primary: "bg-black text-white hover:bg-zinc-900 shadow-soft",
    ghost: "bg-white/50 backdrop-blur border border-zinc-200 hover:bg-white shadow-soft",
    subtle: "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
  };
  return <Comp className={`${base} ${styles[variant]} ${className}`} {...props}>{children}</Comp>;
}
