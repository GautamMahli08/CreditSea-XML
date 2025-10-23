export default function Spinner({ label="Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-600">
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"/>
      </svg>
      {label}
    </div>
  );
}
