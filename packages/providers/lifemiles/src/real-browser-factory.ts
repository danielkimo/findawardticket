import { chromium, type Browser, type Page } from "playwright";
import type { LifeMilesPage, LifeMilesSessionData, RawAwardCard } from "./browser-page.js";
import { LIFEMILES_SELECTORS } from "./selectors.js";

/**
 * 用真實的 Playwright Page 包裝出 LifeMilesPage 介面的實作。
 * 這是唯一會直接依賴 Playwright API 的地方，方便未來替換成官方 API 或其他自動化工具。
 */
function wrapPage(page: Page): LifeMilesPage {
  return {
    async goto(url) {
      await page.goto(url, { waitUntil: "domcontentloaded" });
    },
    async fill(selector, value) {
      await page.fill(selector, value);
    },
    async click(selector) {
      await page.click(selector);
    },
    async waitForSelector(selector, options) {
      await page.waitForSelector(selector, options);
    },
    async isVisible(selector) {
      return page.isVisible(selector);
    },
    async extractAwardResults(): Promise<RawAwardCard[]> {
      // TODO: 依 LifeMiles 實際 DOM 結構調整每個欄位的擷取方式(data-* 屬性或文字內容)。
      return page.$$eval(LIFEMILES_SELECTORS.search.resultCard, (cards) =>
        cards.map((card) => ({
          flightNumber: card.querySelector("[data-field=flight-number]")?.textContent?.trim() ?? "",
          airline: card.querySelector("[data-field=airline]")?.textContent?.trim() ?? "",
          departAt: card.querySelector("[data-field=depart-at]")?.getAttribute("datetime") ?? "",
          arriveAt: card.querySelector("[data-field=arrive-at]")?.getAttribute("datetime") ?? "",
          cabin: card.querySelector("[data-field=cabin]")?.textContent?.trim() ?? "",
          milesRequired: card.querySelector("[data-field=miles]")?.textContent?.trim() ?? "0",
          taxesAmount: card.querySelector("[data-field=taxes-amount]")?.textContent?.trim(),
          taxesCurrency: card.querySelector("[data-field=taxes-currency]")?.textContent?.trim(),
          seatsAvailable: card.querySelector("[data-field=seats]")?.textContent?.trim(),
          stops: card.querySelector("[data-field=stops]")?.textContent?.trim() ?? "0",
        })),
      );
    },
    async close() {
      await page.close();
    },
  };
}

/**
 * 建立一個真實的 Playwright 瀏覽器 session。
 * headless 預設為 true；可透過環境變數 LIFEMILES_HEADFUL=1 在本機開發時觀察自動化過程。
 */
export async function createLifeMilesSession(): Promise<LifeMilesSessionData> {
  const headless = process.env.LIFEMILES_HEADFUL !== "1";
  const browser: Browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  return {
    page: wrapPage(page),
    dispose: async () => {
      await browser.close();
    },
  };
}
