/**
 * 共用型別定義：所有哩程計畫 provider 共用的資料結構。
 * 新增哩程計畫時應重複使用這些型別，避免核心程式與各 provider 之間產生不相容的資料格式。
 */

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface Credentials {
  username: string;
  password: string;
}

export interface PassengerCounts {
  adults: number;
  children?: number;
}

export interface AwardSearchParams {
  origin: string;
  destination: string;
  departDate: string; // ISO 8601 date, e.g. "2025-12-01"
  returnDate?: string; // 若提供則視為來回查詢
  cabin: CabinClass;
  passengers: PassengerCounts;
}

export interface TaxesFees {
  amount: number;
  currency: string;
}

export interface AwardFlightResult {
  provider: string; // provider id, e.g. "lifemiles"
  flightNumber: string;
  airline: string;
  departAt: string; // ISO 8601 datetime
  arriveAt: string; // ISO 8601 datetime
  origin: string;
  destination: string;
  cabin: CabinClass;
  milesRequired: number;
  taxesFees?: TaxesFees;
  seatsAvailable?: number;
  stops: number;
}

/**
 * login() / submitTwoFactor() 的回傳結果。
 * - "success": 登入完成，可以呼叫 searchAwardFlights()
 * - "two_factor_required": 需要使用者輸入2FA驗證碼，前端應顯示OTP輸入欄位
 * - "error": 登入失敗(帳密錯誤、網站異常等)
 */
export type LoginResult =
  | { status: "success"; sessionId: string }
  | { status: "two_factor_required"; sessionId: string; hint?: string }
  | { status: "error"; message: string };

export type SearchResult =
  | { status: "success"; flights: AwardFlightResult[] }
  | { status: "error"; message: string };
