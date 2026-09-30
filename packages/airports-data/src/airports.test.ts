import { describe, expect, it } from "vitest";
import { findAirportByIata, searchAirports } from "./airports.js";

describe("searchAirports", () => {
  it("returns an empty array for empty query", () => {
    expect(searchAirports("")).toEqual([]);
    expect(searchAirports("   ")).toEqual([]);
  });

  it("matches by IATA code case-insensitively", () => {
    const results = searchAirports("tpe");
    expect(results[0]?.iata).toBe("TPE");
  });

  it("ranks exact IATA matches above partial matches", () => {
    const results = searchAirports("bog");
    expect(results[0]?.iata).toBe("BOG");
  });

  it("matches by city name", () => {
    const results = searchAirports("bogotá");
    expect(results.some((a) => a.iata === "BOG")).toBe(true);
  });

  it("respects the limit parameter", () => {
    const results = searchAirports("international", 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});

describe("findAirportByIata", () => {
  it("finds an airport by exact IATA code regardless of case", () => {
    expect(findAirportByIata("bog")?.city).toBe("Bogotá");
    expect(findAirportByIata("BOG")?.city).toBe("Bogotá");
  });

  it("returns undefined for unknown codes", () => {
    expect(findAirportByIata("ZZZ")).toBeUndefined();
  });
});
