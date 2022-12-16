import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as http from './adapters/http/application';
import * as inMemory from './adapters/inMemory';
import { parseConfig } from './config';
import { makeLogger } from './logger';
import { GetChecklistResultUseCase } from './useCases/GetChecklistResultUseCase';
import { UploadToS3UseCase } from './useCases/UploadToS3UseCase';
import { SendNotificationUseCase } from './useCases/SendNotificationUseCase';
import { CreateEventStreamUseCase } from './useCases/CreateEventStreamUseCase';
import { CheckNotificationStatusUseCase } from './useCases/CheckNotificationStatusUseCase';
import { GetNotificationDetailUseCase } from './useCases/GetNotificationDetailUseCase';
import { GetNotificationDocumentMetadataUseCase } from './useCases/GetNotificationDocumentMetadataUseCase';
import { GetPaymentNotificationMetadataUseCase } from './useCases/GetPaymentNotificationMetadataUseCase';
import { GetLegalFactDownloadMetadataUseCase } from './useCases/GetLegalFactDownloadMetadataUseCase';
import { SystemEnv } from './useCases/SystemEnv';
import { ListEventStreamUseCase } from './useCases/ListEventStreamUseCase';
import { GetNotificationPriceUseCase } from './useCases/GetNotificationPriceUseCase';
import { IUNGenerator } from './adapters/randexp/IUNGenerator';

pipe(
  parseConfig(process.env),
  E.map((config) => {
    const logger = makeLogger();

    const systemEnv: SystemEnv = {
      occurrencesAfterComplete: 2, // TODO: occurrencesAfterComplete move this value into configuration
      senderPAId: 'aSenderPaId', // TODO: senderPaId move this value into configuration
      downloadDocumentURL: config.server.downloadDocumentURL,
      sampleStaticPdfFileName: 'sample.pdf',
      iunGenerator: IUNGenerator,
      dateGenerator: () => new Date(),
      recordRepository: inMemory.makeRecordRepository(logger)([]),
      uploadToS3URL: config.server.uploadToS3URL,
    };

    /* init the use cases */
    const uploadToS3UseCase = UploadToS3UseCase(systemEnv);
    const sendNotificationUseCase = SendNotificationUseCase(systemEnv);
    const createEventStreamUseCase = CreateEventStreamUseCase(systemEnv);
    const checkNotificationStatusUseCase = CheckNotificationStatusUseCase(systemEnv);
    const listEventStreamUseCase = ListEventStreamUseCase(systemEnv);
    const getChecklistResultUseCase = GetChecklistResultUseCase(systemEnv);
    const getNotificationDetailUseCase = GetNotificationDetailUseCase(systemEnv);
    const getNotificationDocumentMetadataUseCase = GetNotificationDocumentMetadataUseCase(systemEnv);
    const getPaymentNotificationMetadataUseCase = GetPaymentNotificationMetadataUseCase(systemEnv);
    const getLegalFactDownloadMetadataUseCase = GetLegalFactDownloadMetadataUseCase(systemEnv);
    const getNotificationPriceUseCase = GetNotificationPriceUseCase(systemEnv);

    /* initialize all the driving adapters (e.g.: HTTP API ) */
    const application = http.makeApplication(
      systemEnv,
      uploadToS3UseCase,
      sendNotificationUseCase,
      createEventStreamUseCase,
      checkNotificationStatusUseCase,
      getNotificationDetailUseCase,
      listEventStreamUseCase,
      getChecklistResultUseCase,
      getNotificationDocumentMetadataUseCase,
      getPaymentNotificationMetadataUseCase,
      getLegalFactDownloadMetadataUseCase,
      getNotificationPriceUseCase
    );
    http.startApplication(logger, config, application);
  }),
  E.fold(
    (error) => void makeLogger().error(error),
    (_) => _
  )
);
