import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import type { ProviderRegistry } from "@findawardticket/core";
import { registerProviderRoutes } from "./routes/providers.js";
import { registerAirportRoutes } from "./routes/airports.js";
import { registerHistoryRoutes } from "./routes/history.js";
import { env } from "./env.js";

/**
 * 建立 Fastify app 實例並註冊所有路由。
 * 拆成獨立函式方便測試(可用 app.inject() 打 API 而不需要真的監聽 port)。
 */
export async function buildServer(registry: ProviderRegistry): Promise<FastifyInstance> {
  // 停用 Fastify 內建 logger 的完整 request/response 紀錄，避免帳密/驗證碼被寫進 log。
  // 應用程式內的重要事件一律透過 @findawardticket/core 的 logger(含自動遮罩)輸出。
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: env.webOrigin });

  registerProviderRoutes(app, registry);
  registerAirportRoutes(app);
  registerHistoryRoutes(app);

  app.get("/api/health", async () => ({ status: "ok" }));

  return app;
}
