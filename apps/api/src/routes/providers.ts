import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { ProviderRegistry } from "@findawardticket/core";
import { logger } from "@findawardticket/core";
import { prisma } from "../db.js";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const twoFactorSchema = z.object({
  sessionId: z.string().min(1),
  code: z.string().min(1),
});

const searchSchema = z.object({
  sessionId: z.string().min(1),
  origin: z.string().min(3).max(3),
  destination: z.string().min(3).max(3),
  departDate: z.string().min(1),
  returnDate: z.string().min(1).optional(),
  cabin: z.enum(["economy", "premium_economy", "business", "first"]),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(8).optional(),
});

const logoutSchema = z.object({
  sessionId: z.string().min(1),
});

/**
 * 所有跟哩程計畫互動(登入/2FA/查詢/登出)的 API 路由。
 * 路由本身完全不知道 LifeMiles 的實作細節，只透過 ProviderRegistry 依 providerId
 * 取得對應的 MileageProvider 呼叫共同介面 —— 新增哩程計畫時這裡不需要修改。
 */
export function registerProviderRoutes(app: FastifyInstance, registry: ProviderRegistry): void {
  app.get("/api/providers", async () => {
    return { providers: registry.list() };
  });

  app.post<{ Params: { providerId: string } }>(
    "/api/providers/:providerId/login",
    async (request, reply) => {
      const provider = registry.get(request.params.providerId);
      if (!provider) {
        return reply.code(404).send({ status: "error", message: "Unknown provider" });
      }

      const parsed = credentialsSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ status: "error", message: "Invalid request body" });
      }

      try {
        const result = await provider.login(parsed.data);
        return result;
      } catch (error) {
        logger.error("Unhandled error during provider login", { providerId: provider.id, error: String(error) });
        return reply.code(500).send({ status: "error", message: "Internal server error" });
      }
    },
  );

  app.post<{ Params: { providerId: string } }>(
    "/api/providers/:providerId/2fa",
    async (request, reply) => {
      const provider = registry.get(request.params.providerId);
      if (!provider) {
        return reply.code(404).send({ status: "error", message: "Unknown provider" });
      }

      const parsed = twoFactorSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ status: "error", message: "Invalid request body" });
      }

      try {
        const result = await provider.submitTwoFactor(parsed.data.sessionId, parsed.data.code);
        return result;
      } catch (error) {
        logger.error("Unhandled error during 2FA submission", { providerId: provider.id, error: String(error) });
        return reply.code(500).send({ status: "error", message: "Internal server error" });
      }
    },
  );

  app.post<{ Params: { providerId: string } }>(
    "/api/providers/:providerId/search",
    async (request, reply) => {
      const provider = registry.get(request.params.providerId);
      if (!provider) {
        return reply.code(404).send({ status: "error", message: "Unknown provider" });
      }

      const parsed = searchSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ status: "error", message: "Invalid request body" });
      }

      const { sessionId, children, adults, ...rest } = parsed.data;

      try {
        const result = await provider.searchAwardFlights(sessionId, {
          ...rest,
          passengers: { adults, children },
        });

        if (result.status === "success") {
          await prisma.searchHistory.create({
            data: {
              providerId: provider.id,
              origin: rest.origin,
              destination: rest.destination,
              departDate: rest.departDate,
              returnDate: rest.returnDate,
              cabin: rest.cabin,
              adults,
              children: children ?? 0,
              resultCount: result.flights.length,
              resultsJson: JSON.stringify(result.flights),
            },
          });
        }

        return result;
      } catch (error) {
        logger.error("Unhandled error during award search", { providerId: provider.id, error: String(error) });
        return reply.code(500).send({ status: "error", message: "Internal server error" });
      }
    },
  );

  app.post<{ Params: { providerId: string } }>(
    "/api/providers/:providerId/logout",
    async (request, reply) => {
      const provider = registry.get(request.params.providerId);
      if (!provider) {
        return reply.code(404).send({ status: "error", message: "Unknown provider" });
      }

      const parsed = logoutSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ status: "error", message: "Invalid request body" });
      }

      await provider.logout(parsed.data.sessionId);
      return { status: "ok" };
    },
  );
}
