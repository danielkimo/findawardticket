"use client";

import type { CabinClass } from "@findawardticket/core";

const CABIN_OPTIONS: Array<{ value: CabinClass; label: string }> = [
  { value: "economy", label: "經濟艙" },
  { value: "premium_economy", label: "豪華經濟艙" },
  { value: "business", label: "商務艙" },
  { value: "first", label: "頭等艙" },
];

interface CabinPassengerSelectProps {
  cabin: CabinClass;
  onCabinChange: (cabin: CabinClass) => void;
  adults: number;
  onAdultsChange: (adults: number) => void;
  childrenCount: number;
  onChildrenChange: (children: number) => void;
}

export function CabinPassengerSelect({
  cabin,
  onCabinChange,
  adults,
  onAdultsChange,
  childrenCount,
  onChildrenChange,
}: CabinPassengerSelectProps) {
  return (
    <div className="flex flex-1 gap-2">
      <div className="flex-1">
        <label className="mb-1 block text-xs font-medium text-slate-500">艙等</label>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          value={cabin}
          onChange={(event) => onCabinChange(event.target.value as CabinClass)}
        >
          {CABIN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-24">
        <label className="mb-1 block text-xs font-medium text-slate-500">成人</label>
        <input
          type="number"
          min={1}
          max={9}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          value={adults}
          onChange={(event) => onAdultsChange(Number(event.target.value) || 1)}
        />
      </div>
      <div className="w-24">
        <label className="mb-1 block text-xs font-medium text-slate-500">兒童</label>
        <input
          type="number"
          min={0}
          max={8}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          value={childrenCount}
          onChange={(event) => onChildrenChange(Number(event.target.value) || 0)}
        />
      </div>
    </div>
  );
}
