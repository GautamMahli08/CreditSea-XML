export function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 bg-white shadow-soft">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return <thead className="bg-gradient-to-r from-brand-50 to-accent-50 text-brand-900">{children}</thead>;
}

export function TBody({ children }) {
  return <tbody className="[&>tr]:border-t">{children}</tbody>;
}

export function TR({ children, className = "" }) {
  return <tr className={`hover:bg-brand-50/30 ${className}`}>{children}</tr>;
}

export function TH({ children, className = "" }) {
  return <th className={`px-4 py-3 text-left font-medium ${className}`}>{children}</th>;
}
export function TD({ children, className = "" }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
