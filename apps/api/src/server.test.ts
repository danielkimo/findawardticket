import { describe, expect, it, vi } from "vitest";
import { ProviderRegistry, type MileageProvider } from "@findawardticket/core";

vi.mock("./db.js", () => ({
  prisma: {
    searchHistory: {
      create: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

const { buildServer } = await import("./server.js");

function makeStubProvider(): MileageProvider {
  return {
    id: "stub",
    displayName: "Stub Provider",
    async login(credentials) {
      if (credentials.password === "needs-2fa") {
        return { status: "two_factor_required", sessionId: "sess-1", hint: "check your phone" };
      }
      if (credentials.password === "wrong") {
        return { status: "error", message: "bad credentials" };
      }
      return { status: "success", sessionId: "sess-1" };
    },
    async submitTwoFactor(sessionId, code) {
      if (code !== "123456") {
        return { status: "error", message: "invalid code" };
      }
      return { status: "success", sessionId };
    },
    async searchAwardFlights() {
      return {
        status: "success",
        flights: [
          {
            provider: "stub",
            flightNumber: "ST100",
            airline: "Stub Air",
            departAt: "2025-12-01T00:00:00Z",
            arriveAt: "2025-12-01T05:00:00Z",
            origin: "TPE",
            destination: "BOG",
            cabin: "business",
            milesRequired: 90000,
            stops: 0,
          },
        ],
      };
    },
    async logout() {},
  };
}

describe("API server", () => {
  it("reports health", async () => {
    const registry = new ProviderRegistry();
    const app = await buildServer(registry);
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });

  it("lists registered providers", async () => {
    const registry = new ProviderRegistry();
    registry.register(makeStubProvider());
    const app = await buildServer(registry);
    const res = await app.inject({ method: "GET", url: "/api/providers" });
    expect(res.json()).toEqual({ providers: [{ id: "stub", displayName: "Stub Provider" }] });
  });

  it("returns airport autocomplete results", async () => {
    const registry = new ProviderRegistry();
    const app = await buildServer(registry);
    const res = await app.inject({ method: "GET", url: "/api/airports?query=taipei" });
    const body = res.json();
    expect(body.airports.some((a: { iata: string }) => a.iata === "TPE")).toBe(true);
  });

  it("walks through login -> 2fa -> search -> logout for the stub provider", async () => {
    const registry = new ProviderRegistry();
    registry.register(makeStubProvider());
    const app = await buildServer(registry);

    const loginRes = await app.inject({
      method: "POST",
      url: "/api/providers/stub/login",
      payload: { username: "alice", password: "needs-2fa" },
    });
    expect(loginRes.json()).toEqual({
      status: "two_factor_required",
      sessionId: "sess-1",
      hint: "check your phone",
    });

    const otpRes = await app.inject({
      method: "POST",
      url: "/api/providers/stub/2fa",
      payload: { sessionId: "sess-1", code: "123456" },
    });
    expect(otpRes.json()).toEqual({ status: "success", sessionId: "sess-1" });

    const searchRes = await app.inject({
      method: "POST",
      url: "/api/providers/stub/search",
      payload: {
        sessionId: "sess-1",
        origin: "TPE",
        destination: "BOG",
        departDate: "2025-12-01",
        cabin: "business",
        adults: 1,
      },
    });
    expect(searchRes.json().status).toBe("success");
    expect(searchRes.json().flights).toHaveLength(1);

    const logoutRes = await app.inject({
      method: "POST",
      url: "/api/providers/stub/logout",
      payload: { sessionId: "sess-1" },
    });
    expect(logoutRes.json()).toEqual({ status: "ok" });
  });

  it("returns 404 for an unknown provider", async () => {
    const registry = new ProviderRegistry();
    const app = await buildServer(registry);
    const res = await app.inject({
      method: "POST",
      url: "/api/providers/unknown/login",
      payload: { username: "a", password: "b" },
    });
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 for an invalid request body", async () => {
    const registry = new ProviderRegistry();
    registry.register(makeStubProvider());
    const app = await buildServer(registry);
    const res = await app.inject({
      method: "POST",
      url: "/api/providers/stub/login",
      payload: { username: "" },
    });
    expect(res.statusCode).toBe(400);
  });
});
