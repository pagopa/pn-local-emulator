import * as http from 'http';
import express from 'express';
import { Config } from '../../config';
import { Logger } from '../../logger';
import { SystemEnv } from '../../useCases/SystemEnv';
import { makePreLoadRouter } from './preLoad/router';
import { makeUploadToS3Router } from './uploadToS3/router';
import { makeSendNotificationRouter } from './sendNotification/router';
import { makeChecklistRouter } from './checklist/router';
import { makeCreateEventStreamRouter } from './createEventStream/router';
import { makeNotificationStatusRouter } from './checkNotificationStatus/router';
import { makeGetNotificationDetailRouter } from './getNotificationDetail/router';
import { makeConsumeEventStreamRouter } from './consumeEventStream/router';
import { makeGetNotificationDocumentMetadataRouter } from './getNotificationDocumentMetadata/router';
import { makeGetPaymentNotificationMetadataRouter } from './getPaymentNotificationMetadata/router';
import { makeDownloadDocumentRouter } from './download/router';
import { makeGetLegalFactDocumentRouter } from './getLegalFactDocument/router';
import { makeListEventStreamRouter } from './listEventStream/router';
import { makeGetNotificationPriceRouter } from './getNotificationPrice/router';
import { makeDeleteEventStreamRouter } from './deleteEventStream/router';
import { makeGetEventStreamByIdRouter } from './getStreamById/router';

export const makeApplication = (env: SystemEnv): express.Application => {
  const app = express();
  app.use(express.json());
  // create all routers and return the application
  app.use(makePreLoadRouter(env));
  app.use(makeUploadToS3Router(env));
  app.use(makeSendNotificationRouter(env));
  app.use(makeCreateEventStreamRouter(env));
  app.use(makeNotificationStatusRouter(env));
  app.use(makeConsumeEventStreamRouter(env));
  app.use(makeListEventStreamRouter(env));
  app.use(makeChecklistRouter(env));
  app.use(makeGetNotificationDetailRouter(env));
  app.use(makeGetNotificationDocumentMetadataRouter(env));
  app.use(makeGetPaymentNotificationMetadataRouter(env));
  app.use(makeGetLegalFactDocumentRouter(env));
  app.use(makeGetNotificationPriceRouter(env));
  app.use(makeDownloadDocumentRouter(env));
  app.use(makeDeleteEventStreamRouter(env));
  app.use(makeGetEventStreamByIdRouter(env));
  return app;
};

export const startApplication = (logger: Logger, config: Config, application: express.Application) => {
  const server = http.createServer(application);
  const [hostname, port] = [config.server.hostname, config.server.port];
  server.listen(port, hostname, () => {
    logger.info(`Server is listening on ${hostname}:${port}`);
  });
};
