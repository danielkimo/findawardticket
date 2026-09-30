import { describe, expect, it } from "vitest";
import { performLogin, submitTwoFactorCode } from "./login-flow.js";
import { LIFEMILES_SELECTORS } from "./selectors.js";
import { createFakePage } from "./test-utils/fake-page.js";

const credentials = { username: "alice", password: "s3cret" };

describe("performLogin", () => {
  it("returns success when no 2FA is required and login succeeds", async () => {
    const page = createFakePage();
    const outcome = await performLogin(page, credentials);

    expect(outcome).toEqual({ status: "success" });
    expect(page.calls.fill).toEqual([
      { selector: LIFEMILES_SELECTORS.login.usernameInput, value: "alice" },
      { selector: LIFEMILES_SELECTORS.login.passwordInput, value: "s3cret" },
    ]);
  });

  it("returns two_factor_required when the 2FA form becomes visible", async () => {
    const page = createFakePage({
      visibility: { [LIFEMILES_SELECTORS.twoFactor.container]: true },
    });
    const outcome = await performLogin(page, credentials);

    expect(outcome.status).toBe("two_factor_required");
  });

  it("returns an error when the login error message is shown", async () => {
    const page = createFakePage({
      visibility: { [LIFEMILES_SELECTORS.login.errorMessage]: true },
    });
    const outcome = await performLogin(page, credentials);

    expect(outcome).toEqual({ status: "error", message: expect.stringContaining("帳號或密碼") });
  });
});

describe("submitTwoFactorCode", () => {
  it("returns success once the code is accepted", async () => {
    const page = createFakePage();
    const outcome = await submitTwoFactorCode(page, "123456");

    expect(outcome).toEqual({ status: "success" });
    expect(page.calls.fill).toEqual([
      { selector: LIFEMILES_SELECTORS.twoFactor.codeInput, value: "123456" },
    ]);
  });

  it("returns an error when the code is rejected", async () => {
    const page = createFakePage({
      visibility: { [LIFEMILES_SELECTORS.twoFactor.errorMessage]: true },
    });
    const outcome = await submitTwoFactorCode(page, "000000");

    expect(outcome).toEqual({ status: "error", message: expect.stringContaining("驗證碼") });
  });
});
