import type { AwardFlightResult, AwardSearchParams, CabinClass } from "@findawardticket/core";
import type { LifeMilesPage, RawAwardCard } from "./browser-page.js";
import { DEFAULT_TIMEOUT_MS, LIFEMILES_SELECTORS } from "./selectors.js";

const PROVIDER_ID = "lifemiles";

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
};

export type SearchFlowOutcome =
  | { status: "success"; flights: AwardFlightResult[] }
  | { status: "error"; message: string };

/**
 * 填寫查詢表單(起訖地、日期、艙等、人數)、送出查詢並解析結果。
 */
export async function performSearch(
  page: LifeMilesPage,
  params: AwardSearchParams,
): Promise<SearchFlowOutcome> {
  const selectors = LIFEMILES_SELECTORS.search;

  await page.fill(selectors.originInput, params.origin);
  await page.fill(selectors.destinationInput, params.destination);
  await page.fill(selectors.departDateInput, params.departDate);
  if (params.returnDate) {
    await page.fill(selectors.returnDateInput, params.returnDate);
  }
  await page.fill(selectors.cabinSelect, CABIN_LABELS[params.cabin]);
  await page.fill(selectors.adultsInput, String(params.passengers.adults));
  if (params.passengers.children) {
    await page.fill(selectors.childrenInput, String(params.passengers.children));
  }

  await page.click(selectors.submitButton);

  try {
    await page.waitForSelector(selectors.resultsContainer, { timeout: DEFAULT_TIMEOUT_MS });
  } catch {
    return { status: "error", message: "查詢逾時或找不到任何結果，請調整條件後再試一次。" };
  }

  const rawResults = await page.extractAwardResults();
  const flights = rawResults.map((raw) => mapRawCardToResult(raw, params));

  return { status: "success", flights };
}

function mapRawCardToResult(raw: RawAwardCard, params: AwardSearchParams): AwardFlightResult {
  const result: AwardFlightResult = {
    provider: PROVIDER_ID,
    flightNumber: raw.flightNumber,
    airline: raw.airline,
    departAt: raw.departAt,
    arriveAt: raw.arriveAt,
    origin: params.origin,
    destination: params.destination,
    cabin: params.cabin,
    milesRequired: Number.parseInt(raw.milesRequired.replace(/[^0-9]/g, ""), 10) || 0,
    stops: Number.parseInt(raw.stops.replace(/[^0-9]/g, ""), 10) || 0,
  };

  if (raw.taxesAmount) {
    result.taxesFees = {
      amount: Number.parseFloat(raw.taxesAmount.replace(/[^0-9.]/g, "")) || 0,
      currency: raw.taxesCurrency ?? "USD",
    };
  }

  if (raw.seatsAvailable) {
    const seats = Number.parseInt(raw.seatsAvailable.replace(/[^0-9]/g, ""), 10);
    if (!Number.isNaN(seats)) {
      result.seatsAvailable = seats;
    }
  }

  return result;
}
