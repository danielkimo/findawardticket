/**
 * LifeMiles provider 內部使用的「瀏覽器頁面」最小介面。
 *
 * 之所以定義這個精簡介面而不是直接使用 Playwright 的 `Page`型別，是為了讓
 * 登入/2FA/查詢邏輯(login-flow.ts, search-flow.ts)可以在不啟動真實瀏覽器的情況下
 * 用單元測試涵蓋 —— 測試時傳入一個實作同樣介面的假物件(fake)即可。
 *
 * 真實環境下由 real-browser-factory.ts 用 Playwright 的 Page 實例包裝實作這個介面。
 */
/**
 * 從查詢結果頁面擷取出來的「原始」航班卡片資料(尚未轉型/驗證的字串型別)。
 * 欄位名稱對應到 LIFEMILES_SELECTORS.search 底下各卡片元素的文字內容/屬性，
 * 實際欄位需依真實網站 DOM 結構調整(見 selectors.ts 的提醒)。
 */
export interface RawAwardCard {
  flightNumber: string;
  airline: string;
  departAt: string;
  arriveAt: string;
  cabin: string;
  milesRequired: string;
  taxesAmount?: string;
  taxesCurrency?: string;
  seatsAvailable?: string;
  stops: string;
}

export interface LifeMilesPage {
  goto(url: string): Promise<void>;
  fill(selector: string, value: string): Promise<void>;
  click(selector: string): Promise<void>;
  waitForSelector(selector: string, options?: { timeout?: number }): Promise<void>;
  isVisible(selector: string): Promise<boolean>;
  /** 擷取查詢結果頁面上所有航班卡片的原始資料 */
  extractAwardResults(): Promise<RawAwardCard[]>;
  close(): Promise<void>;
}

/** 一個已登入(或正在登入中)的 LifeMiles session 所持有的資源 */
export interface LifeMilesSessionData {
  page: LifeMilesPage;
  /** 關閉整個瀏覽器 context/instance，session 過期或登出時呼叫 */
  dispose: () => Promise<void>;
}
