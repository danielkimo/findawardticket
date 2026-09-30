import { buildServer } from "./server.js";
import { createProviderRegistry } from "./providers.js";
import { env } from "./env.js";
import { logger } from "@findawardticket/core";

async function main(): Promise<void> {
  const { registry, disposables } = createProviderRegistry();
  const app = await buildServer(registry);

  await app.listen({ port: env.port, host: "0.0.0.0" });
  logger.info(`API server listening on port ${env.port}`);

  const shutdown = async (): Promise<void> => {
    logger.info("Shutting down API server...");
    for (const disposable of disposables) {
      disposable.dispose();
    }
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  logger.error("Fatal error while starting API server", { error: String(error) });
  process.exit(1);
});
