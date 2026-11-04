"use client";
export function FinancePeriod({ from, to, onFrom, onTo, disabled = false }: {
  disabled?: boolean; from: string; to: string; onFrom: (value: string) => void; onTo: (value: string) => void;
}) {
  return <div className="mb-5 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-4">
    <label className="text-sm">Սկսած<input aria-label="Սկսած ամսաթիվ" type="date" disabled={disabled} value={from}
      onChange={event => onFrom(event.target.value)} className="mt-2 block rounded-xl border p-3" /></label>
    <label className="text-sm">Մինչև<input aria-label="Մինչև ամսաթիվ" type="date" disabled={disabled} value={to}
      onChange={event => onTo(event.target.value)} className="mt-2 block rounded-xl border p-3" /></label>
  </div>;
}
