"use client";

import { useEffect, useRef, useState } from "react";
import type { Airport } from "@findawardticket/airports-data";
import { fetchAirports } from "@/lib/api";
import { useDebouncedValue } from "@/lib/use-debounced-value";

interface AirportInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (iata: string) => void;
}

/** 出發地/目的地輸入框，支援機場代碼/城市名稱自動完成 */
export function AirportInput({ label, placeholder, value, onChange }: AirportInputProps) {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    fetchAirports(debouncedQuery).then((results) => {
      if (!cancelled) setOptions(results);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

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
      <input
        type="text"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && options.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {options.map((airport) => (
            <li key={airport.iata}>
              <button
                type="button"
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-brand-50"
                onClick={() => {
                  onChange(airport.iata);
                  setQuery(`${airport.city} (${airport.iata})`);
                  setOpen(false);
                }}
              >
                <span className="font-medium">
                  {airport.city} ({airport.iata})
                </span>
                <span className="text-xs text-slate-500">{airport.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
