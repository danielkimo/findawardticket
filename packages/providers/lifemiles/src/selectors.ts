/**
 * LifeMiles 網站的 CSS 選擇器與網址設定。
 *
 * ⚠️ 重要提醒：LifeMiles(Avianca)網站的實際 DOM 結構可能隨時改版，以下選擇器是
 * 依照網站常見的表單結構所寫的「合理預設值」，**上線前務必實際打開網站以瀏覽器
 * DevTools 核對並更新這些選擇器**。把所有選擇器集中在這個檔案，是為了在網站改版時
 * 只需要修改這一處，而不必動到 login-flow.ts / search-flow.ts 的商業邏輯。
 */
export const LIFEMILES_URLS = {
  login: "https://www.lifemiles.com/login",
  search: "https://www.lifemiles.com/flights/award-search",
};

export const LIFEMILES_SELECTORS = {
  login: {
    usernameInput: "#username",
    passwordInput: "#password",
    submitButton: "button[type=submit]",
    errorMessage: "[data-testid=login-error]",
  },
  twoFactor: {
    // 部分帳號在登入後才會出現此區塊，因此用 isVisible() 偵測是否需要2FA
    codeInput: "#otp-code",
    submitButton: "#otp-submit",
    container: "[data-testid=two-factor-form]",
    errorMessage: "[data-testid=two-factor-error]",
  },
  search: {
    originInput: "#origin",
    destinationInput: "#destination",
    departDateInput: "#depart-date",
    returnDateInput: "#return-date",
    cabinSelect: "#cabin-class",
    adultsInput: "#passengers-adults",
    childrenInput: "#passengers-children",
    submitButton: "#search-award-flights",
    resultsContainer: "[data-testid=award-flight-results]",
    resultCard: "[data-testid=award-flight-card]",
  },
} as const;

export const DEFAULT_TIMEOUT_MS = 15_000;
