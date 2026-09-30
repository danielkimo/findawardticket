import type { FastifyInstance } from "fastify";
import { searchAirports } from "@findawardticket/airports-data";

export function registerAirportRoutes(app: FastifyInstance): void {
  app.get<{ Querystring: { query?: string; limit?: string } }>("/api/airports", async (request) => {
    const { query = "", limit } = request.query;
    const parsedLimit = limit ? Number.parseInt(limit, 10) : undefined;
    return { airports: searchAirports(query, parsedLimit) };
  });
}
