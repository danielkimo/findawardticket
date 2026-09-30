import { describe, expect, it } from "vitest";
import { redactSensitive } from "./logger.js";

describe("redactSensitive", () => {
  it("masks known sensitive keys", () => {
    const input = { username: "alice", password: "hunter2", otp: "123456" };
    expect(redactSensitive(input)).toEqual({
      username: "alice",
      password: "[REDACTED]",
      otp: "[REDACTED]",
    });
  });

  it("masks sensitive keys nested inside objects and arrays", () => {
    const input = {
      credentials: { password: "hunter2" },
      attempts: [{ code: "111111" }, { code: "222222" }],
    };
    expect(redactSensitive(input)).toEqual({
      credentials: { password: "[REDACTED]" },
      attempts: [{ code: "[REDACTED]" }, { code: "[REDACTED]" }],
    });
  });

  it("leaves non-sensitive values untouched", () => {
    expect(redactSensitive({ origin: "TPE", destination: "BOG" })).toEqual({
      origin: "TPE",
      destination: "BOG",
    });
  });
});
