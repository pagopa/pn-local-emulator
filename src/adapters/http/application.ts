import * as http from 'http';
import express from 'express';
import { Config } from '../../config';
import { Logger } from '../../logger';
import { PreLoadUseCase } from '../../useCases/PreLoadUseCase';
import { makePreLoadRouter } from './preLoad/router';

export const makeApplication = (
  preLoadUseCase: PreLoadUseCase,
): express.Application => {
  const app = express();
  app.use(express.json());
  // create all routers and return the application
  app.use(makePreLoadRouter(preLoadUseCase));
  return app;
};

export const startApplication = (
  logger: Logger,
  config: Config,
  application: express.Application
) => {
  const server = http.createServer(application);
  const [hostname, port] = [config.server.hostname, config.server.port];
  server.listen(port, hostname, () => {
    logger.info(`Server is listening on ${hostname}:${port}`);
  });
};
