import type { AwardSearchParams, Credentials, LoginResult, SearchResult } from "./types.js";

/**
 * 所有哩程計畫 provider 必須實作的共同介面。
 *
 * 新增一個哩程計畫的步驟：
 * 1. 在 packages/providers/<provider-id> 建立新套件，實作 MileageProvider。
 * 2. 在 apps/api 的啟動流程中，將該 provider 實例註冊到 ProviderRegistry。
 * 3. 前端不需修改核心邏輯，只需在下拉選單/設定中加入新的 provider id。
 *
 * 實作時務必注意：
 * - login()/submitTwoFactor() 內部產生的瀏覽器 session 或其他登入態，應該透過
 *   SessionStore 管理生命週期(TTL 逾時)，不可自行持久化帳密或驗證碼。
 * - 任何 log 輸出都不可包含明文密碼或2FA驗證碼。
 */
export interface MileageProvider {
  /** provider 的唯一識別碼，例如 "lifemiles" */
  readonly id: string;
  /** 顯示在前端 UI 的名稱，例如 "Avianca LifeMiles" */
  readonly displayName: string;

  /**
   * 使用帳號密碼登入哩程計畫網站。
   * 若網站要求兩階段驗證，回傳 status "two_factor_required"，
   * 呼叫端應保留 sessionId 並提示使用者輸入驗證碼後呼叫 submitTwoFactor()。
   */
  login(credentials: Credentials): Promise<LoginResult>;

  /**
   * 提交兩階段驗證碼，完成登入流程。
   * sessionId 必須是 login() 回傳的同一個 session。
   */
  submitTwoFactor(sessionId: string, code: string): Promise<LoginResult>;

  /**
   * 查詢特定航線/日期的哩程兌換機票。
   * 必須先透過 login()/submitTwoFactor() 取得 status "success" 的 sessionId。
   */
  searchAwardFlights(sessionId: string, params: AwardSearchParams): Promise<SearchResult>;

  /**
   * 登出並釋放該 session 使用的資源(例如關閉瀏覽器 context)。
   */
  logout(sessionId: string): Promise<void>;
}
