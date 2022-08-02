import * as http from "http";
import express from "express";
import { Config } from "../../config";
import { Logger } from "../../logger";

export const makeApplication = (): express.Application => {
  const app = express();
  // create all routers and return the application
  return app;
};

export const startApplication = (logger: Logger, config: Config, application: express.Application) => {
  const server = http.createServer(application);
  const [hostname, port] = [config.server.hostname, config.server.port]
  server.listen(port, hostname, () => {
    logger.info(`Server is listening on ${hostname}:${port}`);
  });

}
