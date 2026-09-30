import { randomUUID } from "node:crypto";

/**
 * SessionStore：純記憶體的 session 儲存，用來暫存登入態(例如 Playwright 瀏覽器 context)。
 *
 * 資安設計重點：
 * - 所有資料只存在於 Node.js process 的記憶體中，從不寫入磁碟、資料庫或 log。
 * - 每個 session 都有 TTL，逾時會自動呼叫 onExpire 回呼(例如關閉瀏覽器、清除憑證)並移除。
 * - 呼叫端(provider 實作)負責決定 session 內要存什麼資料(通常是瀏覽器 context 控制代碼，
 *   而非帳密明文；帳密只在 login() 執行當下的呼叫堆疊中使用，不應存進 session）。
 */

export interface SessionRecord<T> {
  id: string;
  data: T;
  createdAt: number;
  expiresAt: number;
}

export interface SessionStoreOptions {
  /** session 存活時間(毫秒)，預設 20 分鐘 */
  ttlMs?: number;
  /** 逾時掃描頻率(毫秒)，預設 60 秒 */
  sweepIntervalMs?: number;
}

const DEFAULT_TTL_MS = 20 * 60 * 1000;
const DEFAULT_SWEEP_INTERVAL_MS = 60 * 1000;

export class SessionStore<T> {
  private readonly sessions = new Map<string, SessionRecord<T>>();
  private readonly ttlMs: number;
  private readonly sweepTimer: NodeJS.Timeout;

  constructor(
    private readonly onExpire: (session: SessionRecord<T>) => void | Promise<void> = () => {},
    options: SessionStoreOptions = {},
  ) {
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    const sweepIntervalMs = options.sweepIntervalMs ?? DEFAULT_SWEEP_INTERVAL_MS;
    this.sweepTimer = setInterval(() => this.sweep(), sweepIntervalMs);
    this.sweepTimer.unref?.();
  }

  create(data: T): SessionRecord<T> {
    const id = randomUUID();
    const now = Date.now();
    const record: SessionRecord<T> = {
      id,
      data,
      createdAt: now,
      expiresAt: now + this.ttlMs,
    };
    this.sessions.set(id, record);
    return record;
  }

  get(id: string): SessionRecord<T> | undefined {
    const record = this.sessions.get(id);
    if (!record) return undefined;
    if (record.expiresAt < Date.now()) {
      this.sessions.delete(id);
      void this.onExpire(record);
      return undefined;
    }
    return record;
  }

  /** 延長 session 存活時間(例如使用者完成2FA或持續操作時) */
  touch(id: string): void {
    const record = this.sessions.get(id);
    if (record) {
      record.expiresAt = Date.now() + this.ttlMs;
    }
  }

  async delete(id: string): Promise<void> {
    const record = this.sessions.get(id);
    if (record) {
      this.sessions.delete(id);
      await this.onExpire(record);
    }
  }

  private sweep(): void {
    const now = Date.now();
    for (const [id, record] of this.sessions.entries()) {
      if (record.expiresAt < now) {
        this.sessions.delete(id);
        void this.onExpire(record);
      }
    }
  }

  /** 釋放定時器，供測試或應用程式關閉時使用 */
  dispose(): void {
    clearInterval(this.sweepTimer);
  }

  size(): number {
    return this.sessions.size;
  }
}
