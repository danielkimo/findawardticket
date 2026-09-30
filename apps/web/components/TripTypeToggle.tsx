"use client";

import clsx from "clsx";

export type TripType = "one_way" | "round_trip";

interface TripTypeToggleProps {
  value: TripType;
  onChange: (value: TripType) => void;
}

export function TripTypeToggle({ value, onChange }: TripTypeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 p-1 text-sm">
      <button
        type="button"
        className={clsx(
          "rounded-md px-3 py-1.5 font-medium transition",
          value === "round_trip" ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-slate-100",
        )}
        onClick={() => onChange("round_trip")}
      >
        來回
      </button>
      <button
        type="button"
        className={clsx(
          "rounded-md px-3 py-1.5 font-medium transition",
          value === "one_way" ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-slate-100",
        )}
        onClick={() => onChange("one_way")}
      >
        單程
      </button>
    </div>
  );
}
