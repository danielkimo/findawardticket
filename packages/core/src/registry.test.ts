import { describe, expect, it } from "vitest";
import { ProviderRegistry } from "./registry.js";
import type { MileageProvider } from "./provider.js";

function makeStubProvider(id: string): MileageProvider {
  return {
    id,
    displayName: `Stub ${id}`,
    async login() {
      return { status: "success", sessionId: "s1" };
    },
    async submitTwoFactor() {
      return { status: "success", sessionId: "s1" };
    },
    async searchAwardFlights() {
      return { status: "success", flights: [] };
    },
    async logout() {},
  };
}

describe("ProviderRegistry", () => {
  it("registers and retrieves providers by id", () => {
    const registry = new ProviderRegistry();
    const provider = makeStubProvider("lifemiles");
    registry.register(provider);

    expect(registry.get("lifemiles")).toBe(provider);
    expect(registry.getOrThrow("lifemiles")).toBe(provider);
  });

  it("throws when registering a duplicate provider id", () => {
    const registry = new ProviderRegistry();
    registry.register(makeStubProvider("lifemiles"));
    expect(() => registry.register(makeStubProvider("lifemiles"))).toThrow(/already registered/);
  });

  it("throws getOrThrow for unknown provider", () => {
    const registry = new ProviderRegistry();
    expect(() => registry.getOrThrow("unknown")).toThrow(/Unknown mileage provider/);
  });

  it("lists registered providers with id and displayName", () => {
    const registry = new ProviderRegistry();
    registry.register(makeStubProvider("lifemiles"));
    registry.register(makeStubProvider("mileageplus"));

    expect(registry.list()).toEqual(
      expect.arrayContaining([
        { id: "lifemiles", displayName: "Stub lifemiles" },
        { id: "mileageplus", displayName: "Stub mileageplus" },
      ]),
    );
  });
});
