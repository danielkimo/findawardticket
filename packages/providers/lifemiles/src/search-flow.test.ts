import { describe, expect, it } from "vitest";
import type { AwardSearchParams } from "@findawardticket/core";
import { performSearch } from "./search-flow.js";
import { LIFEMILES_SELECTORS } from "./selectors.js";
import { createFakePage } from "./test-utils/fake-page.js";

const baseParams: AwardSearchParams = {
  origin: "TPE",
  destination: "BOG",
  departDate: "2025-12-01",
  cabin: "business",
  passengers: { adults: 1 },
};

describe("performSearch", () => {
  it("fills the search form and maps raw results into AwardFlightResult", async () => {
    const page = createFakePage({
      awardResults: [
        {
          flightNumber: "AV123",
          airline: "Avianca",
          departAt: "2025-12-01T08:00:00Z",
          arriveAt: "2025-12-01T14:00:00Z",
          cabin: "Business",
          milesRequired: "85,000 miles",
          taxesAmount: "$120.50",
          taxesCurrency: "USD",
          seatsAvailable: "3 seats",
          stops: "1 stop",
        },
      ],
    });

    const outcome = await performSearch(page, baseParams);

    expect(outcome.status).toBe("success");
    if (outcome.status !== "success") throw new Error("expected success");
    expect(outcome.flights).toEqual([
      {
        provider: "lifemiles",
        flightNumber: "AV123",
        airline: "Avianca",
        departAt: "2025-12-01T08:00:00Z",
        arriveAt: "2025-12-01T14:00:00Z",
        origin: "TPE",
        destination: "BOG",
        cabin: "business",
        milesRequired: 85000,
        taxesFees: { amount: 120.5, currency: "USD" },
        seatsAvailable: 3,
        stops: 1,
      },
    ]);

    expect(page.calls.fill).toEqual(
      expect.arrayContaining([
        { selector: LIFEMILES_SELECTORS.search.originInput, value: "TPE" },
        { selector: LIFEMILES_SELECTORS.search.destinationInput, value: "BOG" },
      ]),
    );
  });

  it("includes the return date field for round-trip searches", async () => {
    const page = createFakePage({ awardResults: [] });
    await performSearch(page, { ...baseParams, returnDate: "2025-12-10" });

    expect(page.calls.fill).toEqual(
      expect.arrayContaining([
        { selector: LIFEMILES_SELECTORS.search.returnDateInput, value: "2025-12-10" },
      ]),
    );
  });

  it("returns an error when the results container never appears", async () => {
    const page = createFakePage({
      waitForSelectorShouldFail: (selector) =>
        selector === LIFEMILES_SELECTORS.search.resultsContainer,
    });

    const outcome = await performSearch(page, baseParams);

    expect(outcome.status).toBe("error");
  });

  it("returns an empty flight list when there are no award seats", async () => {
    const page = createFakePage({ awardResults: [] });
    const outcome = await performSearch(page, baseParams);

    expect(outcome).toEqual({ status: "success", flights: [] });
  });
});
