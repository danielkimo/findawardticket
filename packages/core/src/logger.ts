const SENSITIVE_KEYS = new Set([
  "password",
  "pass",
  "pwd",
  "code",
  "otp",
  "token",
  "secret",
  "twofactor",
  "two_factor",
  "2fa",
]);

/**
 * 遮罩物件中的敏感欄位(密碼、2FA驗證碼、token等)，供 log 輸出使用。
 * 所有後端 log 呼叫都應該透過這個函式處理任何可能包含使用者輸入的物件，
 * 避免帳密或驗證碼明文寫入 log 檔案。
 */
export function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redactSensitive(val);
      }
    }
    return result;
  }
  return value;
}

/**
 * 簡易 logger wrapper：所有輸出前先經過 redactSensitive() 處理。
 * 正式環境建議替換成 pino/winston 等結構化 logger，但仍應保留遮罩邏輯。
 */
export const logger = {
  info(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, meta !== undefined ? redactSensitive(meta) : "");
  },
  warn(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.warn(`[WARN] ${message}`, meta !== undefined ? redactSensitive(meta) : "");
  },
  error(message: string, meta?: unknown): void {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, meta !== undefined ? redactSensitive(meta) : "");
  },
};
