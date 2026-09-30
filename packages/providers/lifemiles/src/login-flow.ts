import type { Credentials } from "@findawardticket/core";
import type { LifeMilesPage } from "./browser-page.js";
import { DEFAULT_TIMEOUT_MS, LIFEMILES_SELECTORS, LIFEMILES_URLS } from "./selectors.js";

export type LoginFlowOutcome =
  | { status: "success" }
  | { status: "two_factor_required"; hint?: string }
  | { status: "error"; message: string };

/**
 * 執行 LifeMiles 帳密登入流程。
 * 密碼只存在於這個函式呼叫的堆疊中(來自呼叫端傳入的 Credentials)，
 * 執行完畢後不會被保留在 page/session 物件裡，也不會被 log 輸出。
 */
export async function performLogin(
  page: LifeMilesPage,
  credentials: Credentials,
): Promise<LoginFlowOutcome> {
  await page.goto(LIFEMILES_URLS.login);
  await page.fill(LIFEMILES_SELECTORS.login.usernameInput, credentials.username);
  await page.fill(LIFEMILES_SELECTORS.login.passwordInput, credentials.password);
  await page.click(LIFEMILES_SELECTORS.login.submitButton);

  const needsTwoFactor = await page.isVisible(LIFEMILES_SELECTORS.twoFactor.container);
  if (needsTwoFactor) {
    return { status: "two_factor_required", hint: "請輸入您收到的驗證碼" };
  }

  const loginFailed = await page.isVisible(LIFEMILES_SELECTORS.login.errorMessage);
  if (loginFailed) {
    return { status: "error", message: "帳號或密碼錯誤，請重新確認後再試一次。" };
  }

  await page.waitForSelector(LIFEMILES_SELECTORS.search.originInput, {
    timeout: DEFAULT_TIMEOUT_MS,
  });
  return { status: "success" };
}

/**
 * 提交2FA驗證碼完成登入。
 */
export async function submitTwoFactorCode(
  page: LifeMilesPage,
  code: string,
): Promise<LoginFlowOutcome> {
  await page.fill(LIFEMILES_SELECTORS.twoFactor.codeInput, code);
  await page.click(LIFEMILES_SELECTORS.twoFactor.submitButton);

  const twoFactorFailed = await page.isVisible(LIFEMILES_SELECTORS.twoFactor.errorMessage);
  if (twoFactorFailed) {
    return { status: "error", message: "驗證碼錯誤或已過期，請重新輸入。" };
  }

  await page.waitForSelector(LIFEMILES_SELECTORS.search.originInput, {
    timeout: DEFAULT_TIMEOUT_MS,
  });
  return { status: "success" };
}
