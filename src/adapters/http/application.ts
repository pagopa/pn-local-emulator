import * as http from 'http';
import express from 'express';
import { Config } from '../../config';
import { Logger } from '../../logger';
import { PreLoadUseCase } from '../../useCases/PreLoadUseCase';
import { UploadToS3UseCase } from '../../useCases/UploadToS3UseCase';
import { SendNotificationUseCase } from '../../useCases/SendNotificationUseCase';
import { GetChecklistResultUseCase } from '../../useCases/GetChecklistResultUseCase';
import { CreateEventStreamUseCase } from '../../useCases/CreateEventStreamUseCase';
import { makePreLoadRouter } from './preLoad/router';
import { makeUploadToS3Router } from './uploadToS3/router';
import { makeSendNotificationRouter } from './sendNotification/router';
import { makeChecklistRouter } from './checklist/router';
import { makeCreateEventStreamRouter } from './createEventStream/router';

export const makeApplication = (
  preLoadUseCase: PreLoadUseCase,
  uploadToS3UseCase: UploadToS3UseCase,
  sendNotificationUseCase: SendNotificationUseCase,
  createEventStreamUseCase: CreateEventStreamUseCase,
  getChecklistResultUseCase: GetChecklistResultUseCase
): express.Application => {
  const app = express();
  app.use(express.json());
  // create all routers and return the application
  app.use(makePreLoadRouter(preLoadUseCase));
  app.use(makeUploadToS3Router(uploadToS3UseCase));
  app.use(makeSendNotificationRouter(sendNotificationUseCase));
  app.use(makeCreateEventStreamRouter(createEventStreamUseCase));
  app.use(makeChecklistRouter(getChecklistResultUseCase));
  return app;
};

export const startApplication = (logger: Logger, config: Config, application: express.Application) => {
  const server = http.createServer(application);
  const [hostname, port] = [config.server.hostname, config.server.port];
  server.listen(port, hostname, () => {
    logger.info(`Server is listening on ${hostname}:${port}`);
  });
};
