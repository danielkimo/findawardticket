import type { AwardFlightResult } from "@findawardticket/core";
import { format } from "date-fns";

interface ResultsListProps {
  flights: AwardFlightResult[];
}

const CABIN_LABELS: Record<string, string> = {
  economy: "經濟艙",
  premium_economy: "豪華經濟艙",
  business: "商務艙",
  first: "頭等艙",
};

export function ResultsList({ flights }: ResultsListProps) {
  if (flights.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        沒有找到符合條件的哩程兌換機票，試試調整日期或艙等。
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {flights.map((flight, index) => (
        <li
          key={`${flight.flightNumber}-${index}`}
          className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold text-slate-800">
              {flight.airline} {flight.flightNumber}
            </p>
            <p className="text-sm text-slate-500">
              {flight.origin} → {flight.destination} · {formatDateTime(flight.departAt)} -{" "}
              {formatDateTime(flight.arriveAt)}
            </p>
            <p className="text-xs text-slate-400">
              {CABIN_LABELS[flight.cabin] ?? flight.cabin} ·{" "}
              {flight.stops === 0 ? "直飛" : `轉機 ${flight.stops} 次`}
              {flight.seatsAvailable !== undefined ? ` · 剩餘 ${flight.seatsAvailable} 位` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-brand-600">
              {flight.milesRequired.toLocaleString()} 哩程
            </p>
            {flight.taxesFees && (
              <p className="text-xs text-slate-500">
                + {flight.taxesFees.amount.toLocaleString()} {flight.taxesFees.currency} 稅金
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatDateTime(iso: string): string {
  try {
    return format(new Date(iso), "MM/dd HH:mm");
  } catch {
    return iso;
  }
}
