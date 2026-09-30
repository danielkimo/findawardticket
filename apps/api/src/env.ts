export const env = {
  port: Number.parseInt(process.env.PORT ?? "4000", 10),
  databaseUrl: process.env.DATABASE_URL ?? "file:./dev.db",
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
};
