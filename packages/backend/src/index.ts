// Entry point — imports the configured Express app and starts listening.
import app from "./app";
import { PORT, NODE_ENV } from "./config/env";
import logger from "./lib/logger";
import { startExpireOrdersJob } from "./jobs/expireOrders";

app.listen(PORT, () => {
  logger.info({ port: PORT, env: NODE_ENV }, "Backend API listening");
  startExpireOrdersJob();
});
