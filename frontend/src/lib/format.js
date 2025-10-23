export const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const n = new Intl.NumberFormat("en-IN");
export const dt = (d) => d ? new Date(d).toLocaleString() : "-";
export const mask = (v, f="-") => (v ?? f);
