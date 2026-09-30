import { describe, expect, it, vi } from "vitest";
import type { AwardSearchParams } from "@findawardticket/core";
import { LifeMilesProvider } from "./lifemiles-provider.js";
import { LIFEMILES_SELECTORS } from "./selectors.js";
import { createFakePage } from "./test-utils/fake-page.js";

const credentials = { username: "alice", password: "s3cret" };
const searchParams: AwardSearchParams = {
  origin: "TPE",
  destination: "BOG",
  departDate: "2025-12-01",
  cabin: "business",
  passengers: { adults: 1 },
};

describe("LifeMilesProvider", () => {
  it("logs in successfully without 2FA and can search award flights", async () => {
    const dispose = vi.fn(async () => {});
    const page = createFakePage({
      awardResults: [
        {
          flightNumber: "AV123",
          airline: "Avianca",
          departAt: "2025-12-01T08:00:00Z",
          arriveAt: "2025-12-01T14:00:00Z",
          cabin: "Business",
          milesRequired: "85000",
          stops: "0",
        },
      ],
    });
    const provider = new LifeMilesProvider({
      sessionFactory: async () => ({ page, dispose }),
    });

    const loginResult = await provider.login(credentials);
    expect(loginResult.status).toBe("success");
    if (loginResult.status !== "success") throw new Error("expected success");

    const searchResult = await provider.searchAwardFlights(loginResult.sessionId, searchParams);
    expect(searchResult.status).toBe("success");
    if (searchResult.status !== "success") throw new Error("expected success");
    expect(searchResult.flights).toHaveLength(1);

    await provider.logout(loginResult.sessionId);
    expect(dispose).toHaveBeenCalledTimes(1);
    provider.dispose();
  });

  it("walks through the 2FA challenge before allowing search", async () => {
    const dispose = vi.fn(async () => {});
    const page = createFakePage({
      visibility: { [LIFEMILES_SELECTORS.twoFactor.container]: true },
    });
    const provider = new LifeMilesProvider({
      sessionFactory: async () => ({ page, dispose }),
    });

    const loginResult = await provider.login(credentials);
    expect(loginResult.status).toBe("two_factor_required");
    if (loginResult.status !== "two_factor_required") throw new Error("expected 2FA");

    page.setVisible(LIFEMILES_SELECTORS.twoFactor.container, false);
    const otpResult = await provider.submitTwoFactor(loginResult.sessionId, "123456");
    expect(otpResult.status).toBe("success");

    provider.dispose();
  });

  it("returns an error when searching with an unknown session id", async () => {
    const provider = new LifeMilesProvider({
      sessionFactory: async () => ({ page: createFakePage(), dispose: async () => {} }),
    });

    const result = await provider.searchAwardFlights("nonexistent-session", searchParams);
    expect(result).toEqual({ status: "error", message: expect.stringContaining("過期") });
    provider.dispose();
  });

  it("disposes the browser session when login fails", async () => {
    const dispose = vi.fn(async () => {});
    const page = createFakePage({
      visibility: { [LIFEMILES_SELECTORS.login.errorMessage]: true },
    });
    const provider = new LifeMilesProvider({
      sessionFactory: async () => ({ page, dispose }),
    });

    const result = await provider.login(credentials);
    expect(result.status).toBe("error");
    expect(dispose).toHaveBeenCalledTimes(1);
    provider.dispose();
  });
});
