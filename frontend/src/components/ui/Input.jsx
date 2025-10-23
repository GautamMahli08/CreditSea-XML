export default function Input({ className="", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-zinc-200 bg-white/80 backdrop-blur px-3 py-2 text-sm outline-none shadow-soft placeholder:text-zinc-400 focus:ring-2 focus:ring-black/10 ${className}`}
      {...props}
    />
  );
}
