import type { LifeMilesPage, RawAwardCard } from "../browser-page.js";

export interface FakePageOptions {
  /** selector -> visible 對應表，預設全部為 false */
  visibility?: Record<string, boolean>;
  /** extractAwardResults() 要回傳的假資料 */
  awardResults?: RawAwardCard[];
  /** waitForSelector 遇到此 selector 時要丟出錯誤(模擬逾時/找不到元素) */
  waitForSelectorShouldFail?: (selector: string) => boolean;
}

export interface FakePage extends LifeMilesPage {
  calls: {
    goto: string[];
    fill: Array<{ selector: string; value: string }>;
    click: string[];
    waitForSelector: string[];
  };
  setVisible(selector: string, visible: boolean): void;
}

/**
 * 建立一個實作 LifeMilesPage 介面的假物件，供 login-flow/search-flow/provider 單元測試使用，
 * 不需要啟動真實瀏覽器。
 */
export function createFakePage(options: FakePageOptions = {}): FakePage {
  const visibility: Record<string, boolean> = { ...options.visibility };
  const calls: FakePage["calls"] = { goto: [], fill: [], click: [], waitForSelector: [] };

  return {
    calls,
    setVisible(selector: string, visible: boolean) {
      visibility[selector] = visible;
    },
    async goto(url) {
      calls.goto.push(url);
    },
    async fill(selector, value) {
      calls.fill.push({ selector, value });
    },
    async click(selector) {
      calls.click.push(selector);
    },
    async waitForSelector(selector) {
      calls.waitForSelector.push(selector);
      if (options.waitForSelectorShouldFail?.(selector)) {
        throw new Error(`Timed out waiting for selector: ${selector}`);
      }
    },
    async isVisible(selector) {
      return visibility[selector] ?? false;
    },
    async extractAwardResults() {
      return options.awardResults ?? [];
    },
    async close() {
      // no-op
    },
  };
}
