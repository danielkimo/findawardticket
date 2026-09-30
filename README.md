# FindAwardTicket 哩程機票搜尋工具

一個可擴充的「多哩程計畫」哩程機票（award ticket）搜尋工具。使用者輸入常客帳號的帳號密碼，並在需要時完成兩階段驗證（2FA/OTP），系統會代替使用者登入哩程計畫網站，查詢特定航線／日期目前可兌換的哩程機票。

第一階段（MVP）僅實作 **Avianca LifeMiles**，但核心架構已設計為可插拔的多 provider 系統，方便未來加入 United MileagePlus、Turkish Miles&Smiles 等其他哩程計畫。

## 技術棧

| 區塊 | 技術 |
| --- | --- |
| Monorepo 管理 | pnpm workspaces + Turborepo |
| 前端 | Next.js 14 (App Router) + React + TypeScript + Tailwind CSS |
| 後端 API | Fastify + TypeScript（獨立服務，非 Next.js API routes，因為需要長時間執行 Playwright 瀏覽器自動化） |
| 瀏覽器自動化 | Playwright（用於登入 LifeMiles 網站與抓取查詢結果） |
| 資料庫 | SQLite + Prisma（僅儲存「查詢歷史/結果」，**絕不儲存帳密或2FA驗證碼**） |
| 測試 | Vitest（所有套件與前後端皆使用同一測試框架） |

## 專案結構

```
findawardticket/
├── apps/
│   ├── web/                     # Next.js 前端（訂機票風格 UI）
│   └── api/                     # Fastify 後端 API + Prisma
├── packages/
│   ├── core/                    # 共用型別、MileageProvider 介面、SessionStore、redacting logger
│   ├── airports-data/           # 機場自動完成用的靜態資料集
│   └── providers/
│       └── lifemiles/           # LifeMiles provider（Playwright 自動化實作）
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### 核心設計：`MileageProvider` 介面

所有哩程計畫 provider 都必須實作 `packages/core/src/provider.ts` 中定義的介面：

```ts
interface MileageProvider {
  readonly id: string;
  readonly displayName: string;
  login(credentials: Credentials): Promise<LoginResult>;
  submitTwoFactor(sessionId: string, code: string): Promise<LoginResult>;
  searchAwardFlights(sessionId: string, params: AwardSearchParams): Promise<SearchResult>;
  logout(sessionId: string): Promise<void>;
}
```

- `login()` 若該哩程網站要求 2FA，回傳 `status: "two_factor_required"`，並附上一個暫時的 `sessionId`；前端提示使用者輸入驗證碼後再呼叫 `submitTwoFactor()`。
- 登入態（例如 Playwright 的瀏覽器 context/page）透過 `packages/core/src/session-store.ts` 的 `SessionStore` 管理，具備 TTL 逾時自動釋放機制，逾時時會呼叫 `onExpire` 回呼關閉瀏覽器，**絕不落地儲存**。
- `apps/api/src/providers.ts` 使用 `ProviderRegistry` 註冊所有可用 provider；REST API（`apps/api/src/routes/providers.ts`）皆以 `providerId` 參數化，對前端與資料庫完全 provider-agnostic。

## 如何新增一個新的哩程計畫 provider

1. 在 `packages/providers/<provider-id>` 建立新套件（可參考 `packages/providers/lifemiles` 的檔案結構）。
2. 實作 `MileageProvider` 介面：
   - 若該哩程網站沒有公開/穩定 API，比照 LifeMiles 的做法：定義一個最小化、可測試的 `XxxPage` 介面（見 `browser-page.ts`），將 Playwright 操作封裝在 `login-flow.ts`/`search-flow.ts` 等「純邏輯」檔案中，讓核心流程可用假的（fake）Page 實作做單元測試，只有 `real-browser-factory.ts` 直接依賴 Playwright。
   - 若該哩程網站有官方 API，可直接呼叫 API，不需要瀏覽器自動化層。
3. 為登入（含 2FA）、查詢邏輯撰寫單元測試（比照 `login-flow.test.ts`、`search-flow.test.ts`、`lifemiles-provider.test.ts`）。
4. 在 `apps/api/src/providers.ts` 中將新 provider 實例註冊進 `ProviderRegistry`。
5. 前端不需修改核心邏輯：`SearchForm.tsx` 目前先寫死 provider 為 LifeMiles，未來若要支援多 provider 選擇，只需在 UI 加入下拉選單，呼叫 `/api/providers` 列表即可（後端已是 provider-agnostic 設計）。

## 本機啟動方式

### 前置需求

- Node.js >= 20
- pnpm（`npm install -g pnpm`）

### 安裝依賴

```bash
pnpm install
```

### 安裝 Playwright 瀏覽器（第一次使用真實登入自動化前必須執行）

本專案在 `pnpm install` 時預設**不會**自動下載 Playwright 瀏覽器執行檔（避免在 CI/沙盒環境下載大型二進位檔）。若要讓 LifeMiles provider 的登入/查詢自動化實際運作，請先執行：

```bash
npx playwright install chromium
```

若未執行此步驟，單元測試仍可正常執行（測試皆使用 fake `LifeMilesPage`，不會啟動真實瀏覽器），但呼叫真實 API 端點會因為找不到瀏覽器執行檔而失敗。

### 設定環境變數

```bash
# apps/api
cp apps/api/.env.example apps/api/.env

# apps/web
cp apps/web/.env.local.example apps/web/.env.local
```

依需求調整 `apps/api/.env` 內的 `DATABASE_URL`、`PORT`、`CORS_ORIGIN` 等設定，以及 `apps/web/.env.local` 內的 `NEXT_PUBLIC_API_BASE_URL`。

### 初始化資料庫（Prisma + SQLite）

```bash
cd apps/api
npx prisma migrate dev --name init
cd ../..
```

### 啟動開發伺服器

```bash
# 同時啟動 apps/api 與 apps/web（透過 turbo）
pnpm dev
```

- 前端預設在 http://localhost:3000
- 後端 API 預設在 http://localhost:4000（依 `apps/api/.env` 設定為準）

### 建置

```bash
pnpm build
```

### 測試 / Lint / 型別檢查

```bash
pnpm test        # 執行所有套件的 Vitest 單元測試
pnpm lint        # ESLint（含 Next.js 專用規則）
pnpm typecheck   # tsc --noEmit
```

## 資安考量與限制

1. **帳密與 2FA 驗證碼絕不落地儲存**：
   - 使用者輸入的常客帳號帳密與 2FA 驗證碼，只會短暫存在於後端記憶體中（透過 `SessionStore`），用於驅動 Playwright 登入流程，過程結束或逾時（預設 20 分鐘）後即從記憶體釋放，並關閉對應的瀏覽器 context。
   - Prisma/SQLite 資料庫（`SearchHistory` model）**只儲存查詢條件與結果**（航線、日期、艙等、人數、兌換所需哩程數等），完全不含任何帳號、密碼或驗證碼欄位。
2. **不寫入明文密碼到 log**：
   - `packages/core/src/logger.ts` 實作了 `redactSensitive()`，會遞迴遮蔽任何 key 符合黑名單（password、code、otp、token、secret、2fa 等）的欄位。
   - Fastify 後端關閉了預設的 request logger（`Fastify({ logger: false })`），避免框架自動把包含密碼欄位的 request body 印出。
3. **傳輸安全**：正式環境務必透過 HTTPS 部署前後端，並確保 CORS 設定（`CORS_ORIGIN`）限制在信任的網域。
4. **Session 逾時與釋放**：`SessionStore` 具備 TTL 機制與定期清理（預設每 60 秒掃描一次），逾時的 session 會觸發 `onExpire` 回呼關閉底層瀏覽器，避免殘留的瀏覽器行程或帳號在遠端網站上的長期登入態。
5. **已知限制**：
   - `packages/providers/lifemiles/src/selectors.ts` 中的 CSS 選擇器與頁面流程，是根據一般常見哩程網站介面推測撰寫的**佔位符（placeholder）**，尚未對照 LifeMiles 實際網站驗證，正式使用前必須實際登入 LifeMiles 網站核對 DOM 結構並更新選擇器。
   - 哩程網站可能設有反爬蟲/機器人偵測機制（如 Cloudflare、行為分析等），自動化登入有被偵測封鎖的風險，使用時請遵守該哩程計畫的服務條款。
   - 目前僅支援單一 provider（LifeMiles）同時查詢；多 provider 並行查詢/比較尚未實作。
   - 本專案不含任何速率限制（rate limiting）或帳號鎖定保護機制，正式上線前建議加上以避免觸發哩程網站的異常登入告警。
   - 目前無使用者帳號系統／驗證機制保護本工具本身的 API，任何能存取 API 的人都可以嘗試登入任意哩程帳號；正式上線前應加上工具自身的身份驗證與授權機制。
