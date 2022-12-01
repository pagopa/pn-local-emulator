import * as http from 'http';
import express from 'express';
import { Config } from '../../config';
import { Logger } from '../../logger';
import { PreLoadUseCase } from '../../useCases/PreLoadUseCase';
import { UploadToS3UseCase } from '../../useCases/UploadToS3UseCase';
import { SendNotificationUseCase } from '../../useCases/SendNotificationUseCase';
import { CheckNotificationStatusUseCase } from '../../useCases/CheckNotificationStatusUseCase';
import { GetChecklistResultUseCase } from '../../useCases/GetChecklistResultUseCase';
import { CreateEventStreamUseCase } from '../../useCases/CreateEventStreamUseCase';
import { ListEventStreamUseCase } from '../../useCases/ListEventStreamUseCase';
import { GetNotificationDetailUseCase } from '../../useCases/GetNotificationDetailUseCase';
import { ConsumeEventStreamUseCase } from '../../useCases/ConsumeEventStreamUseCase';
import { GetNotificationDocumentMetadataUseCase } from '../../useCases/GetNotificationDocumentMetadataUseCase';
import { GetPaymentNotificationMetadataUseCase } from '../../useCases/GetPaymentNotificationMetadataUseCase';
import { GetLegalFactDownloadMetadataUseCase } from '../../useCases/GetLegalFactDownloadMetadataUseCase';
import { GetNotificationPriceUseCase } from '../../useCases/GetNotificationPriceUseCase';
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

export const makeApplication = (
  preLoadUseCase: PreLoadUseCase,
  uploadToS3UseCase: UploadToS3UseCase,
  sendNotificationUseCase: SendNotificationUseCase,
  createEventStreamUseCase: CreateEventStreamUseCase,
  checkNotificationStatusUseCase: CheckNotificationStatusUseCase,
  getNotificationDetailUseCase: GetNotificationDetailUseCase,
  consumeEventStreamUseCase: ConsumeEventStreamUseCase,
  listEventStreamUseCase: ListEventStreamUseCase,
  getChecklistResultUseCase: GetChecklistResultUseCase,
  getNotificationDocumentMetadataUseCase: GetNotificationDocumentMetadataUseCase,
  getPaymentNotificationMetadataUseCase: GetPaymentNotificationMetadataUseCase,
  getLegalFactDownloadMetadataUseCase: GetLegalFactDownloadMetadataUseCase,
  getNotificationPriceUseCase: GetNotificationPriceUseCase
): express.Application => {
  const app = express();
  app.use(express.json());
  // create all routers and return the application
  app.use(makePreLoadRouter(preLoadUseCase));
  app.use(makeUploadToS3Router(uploadToS3UseCase));
  app.use(makeSendNotificationRouter(sendNotificationUseCase));
  app.use(makeCreateEventStreamRouter(createEventStreamUseCase));
  app.use(makeNotificationStatusRouter(checkNotificationStatusUseCase));
  app.use(makeConsumeEventStreamRouter(consumeEventStreamUseCase));
  app.use(makeListEventStreamRouter(listEventStreamUseCase));
  app.use(makeChecklistRouter(getChecklistResultUseCase));
  app.use(makeGetNotificationDetailRouter(getNotificationDetailUseCase));
  app.use(makeGetNotificationDocumentMetadataRouter(getNotificationDocumentMetadataUseCase));
  app.use(makeGetPaymentNotificationMetadataRouter(getPaymentNotificationMetadataUseCase));
  app.use(makeGetLegalFactDocumentRouter(getLegalFactDownloadMetadataUseCase));
  app.use(makeGetNotificationPriceRouter(getNotificationPriceUseCase));
  app.use(makeDownloadDocumentRouter());
  return app;
};

export const startApplication = (logger: Logger, config: Config, application: express.Application) => {
  const server = http.createServer(application);
  const [hostname, port] = [config.server.hostname, config.server.port];
  server.listen(port, hostname, () => {
    logger.info(`Server is listening on ${hostname}:${port}`);
  });
};
