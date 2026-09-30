import {
  SessionStore,
  logger,
  type AwardSearchParams,
  type Credentials,
  type LoginResult,
  type MileageProvider,
  type SearchResult,
} from "@findawardticket/core";
import type { LifeMilesSessionData } from "./browser-page.js";
import { performLogin, submitTwoFactorCode } from "./login-flow.js";
import { performSearch } from "./search-flow.js";
import { createLifeMilesSession } from "./real-browser-factory.js";

export type LifeMilesSessionFactory = () => Promise<LifeMilesSessionData>;

export interface LifeMilesProviderOptions {
  /** 用於建立瀏覽器 session 的工廠函式；測試時可注入假的實作以避免啟動真實瀏覽器 */
  sessionFactory?: LifeMilesSessionFactory;
  /** session 存活時間(毫秒)，預設 20 分鐘 */
  ttlMs?: number;
}

/**
 * Avianca LifeMiles 哩程計畫 provider。
 * 用 Playwright 瀏覽器自動化完成登入(含2FA)與獎勵機票查詢，
 * 並透過 SessionStore 管理瀏覽器 session 的生命週期(逾時自動關閉、釋放資源)。
 */
export class LifeMilesProvider implements MileageProvider {
  readonly id = "lifemiles";
  readonly displayName = "Avianca LifeMiles";

  private readonly sessionFactory: LifeMilesSessionFactory;
  private readonly sessions: SessionStore<LifeMilesSessionData>;

  constructor(options: LifeMilesProviderOptions = {}) {
    this.sessionFactory = options.sessionFactory ?? createLifeMilesSession;
    this.sessions = new SessionStore<LifeMilesSessionData>(
      async (record) => {
        try {
          await record.data.dispose();
        } catch (error) {
          logger.warn("Failed to dispose LifeMiles browser session on expiry", {
            sessionId: record.id,
            error: String(error),
          });
        }
      },
      { ttlMs: options.ttlMs },
    );
  }

  async login(credentials: Credentials): Promise<LoginResult> {
    const session = await this.sessionFactory();
    const record = this.sessions.create(session);

    try {
      const outcome = await performLogin(session.page, credentials);
      if (outcome.status === "error") {
        await this.sessions.delete(record.id);
        return { status: "error", message: outcome.message };
      }
      if (outcome.status === "two_factor_required") {
        return { status: "two_factor_required", sessionId: record.id, hint: outcome.hint };
      }
      return { status: "success", sessionId: record.id };
    } catch (error) {
      logger.error("LifeMiles login failed unexpectedly", { error: String(error) });
      await this.sessions.delete(record.id);
      return { status: "error", message: "登入時發生未預期的錯誤，請稍後再試。" };
    }
  }

  async submitTwoFactor(sessionId: string, code: string): Promise<LoginResult> {
    const record = this.sessions.get(sessionId);
    if (!record) {
      return { status: "error", message: "登入 session 已過期，請重新登入。" };
    }

    try {
      const outcome = await submitTwoFactorCode(record.data.page, code);
      if (outcome.status === "error") {
        return { status: "error", message: outcome.message };
      }
      if (outcome.status === "two_factor_required") {
        return { status: "two_factor_required", sessionId, hint: outcome.hint };
      }
      this.sessions.touch(sessionId);
      return { status: "success", sessionId };
    } catch (error) {
      logger.error("LifeMiles 2FA submission failed unexpectedly", { error: String(error) });
      return { status: "error", message: "驗證時發生未預期的錯誤，請稍後再試。" };
    }
  }

  async searchAwardFlights(sessionId: string, params: AwardSearchParams): Promise<SearchResult> {
    const record = this.sessions.get(sessionId);
    if (!record) {
      return { status: "error", message: "登入 session 已過期，請重新登入。" };
    }

    try {
      const outcome = await performSearch(record.data.page, params);
      this.sessions.touch(sessionId);
      if (outcome.status === "error") {
        return { status: "error", message: outcome.message };
      }
      return { status: "success", flights: outcome.flights };
    } catch (error) {
      logger.error("LifeMiles award search failed unexpectedly", { error: String(error) });
      return { status: "error", message: "查詢時發生未預期的錯誤，請稍後再試。" };
    }
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessions.delete(sessionId);
  }

  /** 供應用程式關閉時釋放定時器資源 */
  dispose(): void {
    this.sessions.dispose();
  }
}
