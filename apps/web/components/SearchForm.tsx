"use client";

import { useEffect, useState } from "react";
import type { AwardFlightResult, CabinClass } from "@findawardticket/core";
import { fetchProviders, searchAwardFlights, type ProviderSummary } from "@/lib/api";
import { AirportInput } from "./AirportInput";
import { DatePickerField } from "./DatePickerField";
import { CabinPassengerSelect } from "./CabinPassengerSelect";
import { TripTypeToggle, type TripType } from "./TripTypeToggle";
import { LoginPanel } from "./LoginPanel";
import { ResultsList } from "./ResultsList";

export function SearchForm() {
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [providerId, setProviderId] = useState<string>("lifemiles");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [tripType, setTripType] = useState<TripType>("round_trip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [cabin, setCabin] = useState<CabinClass>("business");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [flights, setFlights] = useState<AwardFlightResult[] | null>(null);

  useEffect(() => {
    fetchProviders().then((list) => {
      setProviders(list);
      if (list.length > 0 && !list.some((p) => p.id === providerId)) {
        setProviderId(list[0]!.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentProvider = providers.find((p) => p.id === providerId);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearchError(null);

    if (!sessionId) {
      setSearchError("請先登入哩程帳號後再查詢");
      return;
    }
    if (!origin || !destination || !departDate) {
      setSearchError("請填寫出發地、目的地與出發日期");
      return;
    }

    setSearching(true);
    const result = await searchAwardFlights(providerId, {
      sessionId,
      origin,
      destination,
      departDate: departDate.toISOString().slice(0, 10),
      returnDate:
        tripType === "round_trip" && returnDate ? returnDate.toISOString().slice(0, 10) : undefined,
      cabin,
      adults,
      children,
    });
    setSearching(false);

    if (result.status === "success") {
      setFlights(result.flights);
    } else {
      setSearchError(result.message);
      setFlights(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">哩程機票搜尋工具</h1>
        <p className="mt-1 text-sm text-slate-500">
          登入你的哩程計畫帳號，查詢特定航線/日期目前有哪些哩程兌換機票可用
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-500">哩程計畫</label>
          <select
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
            value={providerId}
            onChange={(event) => {
              setProviderId(event.target.value);
              setSessionId(null);
            }}
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.displayName}
              </option>
            ))}
          </select>
        </div>
        <LoginPanel
          providerId={providerId}
          providerName={currentProvider?.displayName ?? providerId}
          sessionId={sessionId}
          onSessionChange={setSessionId}
        />
      </section>

      <form onSubmit={handleSearch} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <TripTypeToggle value={tripType} onChange={setTripType} />

        <div className="flex flex-col gap-3 sm:flex-row">
          <AirportInput label="出發地" placeholder="城市或機場代碼" value={origin} onChange={setOrigin} />
          <AirportInput
            label="目的地"
            placeholder="城市或機場代碼"
            value={destination}
            onChange={setDestination}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <DatePickerField label="出發日期" value={departDate} onChange={setDepartDate} minDate={new Date()} />
          {tripType === "round_trip" && (
            <DatePickerField
              label="回程日期"
              value={returnDate}
              onChange={setReturnDate}
              minDate={departDate ?? new Date()}
            />
          )}
        </div>

        <CabinPassengerSelect
          cabin={cabin}
          onCabinChange={setCabin}
          adults={adults}
          onAdultsChange={setAdults}
          childrenCount={children}
          onChildrenChange={setChildren}
        />

        {searchError && <p className="text-sm text-red-600">{searchError}</p>}

        <button
          type="submit"
          disabled={searching}
          className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {searching ? "查詢中..." : "查詢哩程機票"}
        </button>
      </form>

      {flights && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">查詢結果</h2>
          <ResultsList flights={flights} />
        </section>
      )}
    </div>
  );
}
