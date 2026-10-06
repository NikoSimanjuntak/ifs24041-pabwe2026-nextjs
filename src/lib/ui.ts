// Kelas Tailwind yang dipakai ulang agar tampilan konsisten di seluruh fitur.
const btn =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const ui = {
  field:
    "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25",
  label: "mb-1.5 block text-sm font-medium text-ink",
  error: "mt-1 text-xs font-medium text-danger",
  btnPrimary: `${btn} bg-brand text-white hover:bg-brand-strong`,
  btnGhost: `${btn} border border-line bg-white text-ink hover:bg-brand-soft`,
  btnDanger: `${btn} bg-danger text-white hover:opacity-90`,
  iconBtn:
    "inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-brand-soft hover:text-brand-strong",
  card: "rounded-xl border border-line bg-surface",
} as const;
