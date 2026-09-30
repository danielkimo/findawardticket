import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultsList } from "./ResultsList";
import type { AwardFlightResult } from "@findawardticket/core";

const sampleFlight: AwardFlightResult = {
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
  stops: 0,
};

describe("ResultsList", () => {
  it("shows an empty state message when there are no flights", () => {
    render(<ResultsList flights={[]} />);
    expect(screen.getByText(/沒有找到符合條件/)).toBeInTheDocument();
  });

  it("renders flight details for each result", () => {
    render(<ResultsList flights={[sampleFlight]} />);
    expect(screen.getByText("Avianca AV123")).toBeInTheDocument();
    expect(screen.getByText(/85,000 哩程/)).toBeInTheDocument();
    expect(screen.getByText(/直飛/)).toBeInTheDocument();
  });
});
