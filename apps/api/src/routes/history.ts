import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export function registerHistoryRoutes(app: FastifyInstance): void {
  app.get<{ Querystring: { limit?: string } }>("/api/history", async (request) => {
    const limit = request.query.limit ? Number.parseInt(request.query.limit, 10) : 20;
    const entries = await prisma.searchHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

    return {
      history: entries.map((entry) => ({
        id: entry.id,
        providerId: entry.providerId,
        origin: entry.origin,
        destination: entry.destination,
        departDate: entry.departDate,
        returnDate: entry.returnDate,
        cabin: entry.cabin,
        adults: entry.adults,
        children: entry.children,
        resultCount: entry.resultCount,
        flights: JSON.parse(entry.resultsJson),
        createdAt: entry.createdAt,
      })),
    };
  });
}
