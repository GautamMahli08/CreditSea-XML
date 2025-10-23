export default function Empty({ title="Nothing here yet", hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-zinc-500">
      <div className="text-lg font-medium">{title}</div>
      {hint && <div className="text-xs">{hint}</div>}
    </div>
  );
}
