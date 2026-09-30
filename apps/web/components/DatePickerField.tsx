"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";

interface DatePickerFieldProps {
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
}

/** 從日曆挑選日期的輸入欄位，點擊後彈出 react-day-picker 月曆 */
export function DatePickerField({ label, value, onChange, minDate }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        {value ? format(value, "yyyy/MM/dd") : "選擇日期"}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            disabled={minDate ? { before: minDate } : undefined}
          />
        </div>
      )}
    </div>
  );
}
