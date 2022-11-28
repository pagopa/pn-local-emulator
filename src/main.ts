import crypto from 'crypto';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as http from './adapters/http/application';
import * as inMemory from './adapters/inMemory';
import { parseConfig } from './config';
import { makeLogger } from './logger';
import { GetChecklistResultUseCase } from './useCases/GetChecklistResultUseCase';
import { PreLoadUseCase } from './useCases/PreLoadUseCase';
import { UploadToS3UseCase } from './useCases/UploadToS3UseCase';
import { SendNotificationUseCase } from './useCases/SendNotificationUseCase';
import { CreateEventStreamUseCase } from './useCases/CreateEventStreamUseCase';
import { CheckNotificationStatusUseCase } from './useCases/CheckNotificationStatusUseCase';
import { PreLoadRecord } from './domain/PreLoadRepository';
import { UploadToS3Record } from './domain/UploadToS3RecordRepository';
import { NewNotificationRecord } from './domain/NewNotificationRepository';
import { CheckNotificationStatusRecord } from './domain/CheckNotificationStatusRepository';
import { CreateEventStreamRecord } from './domain/CreateEventStreamRecordRepository';
import { GetNotificationDetailUseCase } from './useCases/GetNotificationDetailUseCase';
import { GetNotificationDetailRecord } from './domain/GetNotificationDetailRepository';
import { ConsumeEventStreamRecord } from './domain/ConsumeEventStreamRecordRepository';
import { ConsumeEventStreamUseCase } from './useCases/ConsumeEventStreamUseCase';
import { ListEventStreamRecord } from './domain/ListEventStreamRecordRepository';
import { GetNotificationDocumentMetadataUseCase } from './useCases/GetNotificationDocumentMetadataUseCase';
import { GetNotificationDocumentMetadataRecord } from './domain/GetNotificationDocumentMetadataRepository';
import { GetPaymentNotificationMetadataUseCase } from './useCases/GetPaymentNotificationMetadataUseCase';
import { GetPaymentNotificationMetadataRecord } from './domain/GetPaymentNotificationMetadataRecordRepository';
import { GetLegalFactDownloadMetadataUseCase } from './useCases/GetLegalFactDownloadMetadataUseCase';
import { LegalFactDownloadMetadataRecord } from './domain/LegalFactDownloadMetadataRecordRepository';
import { SystemEnv } from './useCases/SystemEnv';
import { ListEventStreamUseCase } from './useCases/ListEventStreamUseCase';

pipe(
  parseConfig(process.env),
  E.map((config) => {
    const logger = makeLogger();
    const mkRepository = inMemory.makeRepository(logger);
    /* put here the driven adapters (e.g.: Repositories ) */
    const preLoadRecordRepository = mkRepository<PreLoadRecord>([]);
    const uploadToS3RecordRepository = mkRepository<UploadToS3Record>([]);
    const newNotificationRepository = mkRepository<NewNotificationRecord>([]);
    const createEventStreamRecordRepository = mkRepository<CreateEventStreamRecord>([]);
    const checkNotificationStatusRepository = mkRepository<CheckNotificationStatusRecord>([]);
    const getNotificationDetailRepository = mkRepository<GetNotificationDetailRecord>([]);
    const consumeEventStreamRepository = mkRepository<ConsumeEventStreamRecord>([]);
    const listEventStreamRecordRepository = mkRepository<ListEventStreamRecord>([]);
    const getNotificationDocumentMetadataRecordRepository = mkRepository<GetNotificationDocumentMetadataRecord>([]);
    const getPaymentNotificationMetadataRecordRepository = mkRepository<GetPaymentNotificationMetadataRecord>([]);
    const getLegalFactDownloadMetadataRecordRepository = mkRepository<LegalFactDownloadMetadataRecord>([]);

    const systemEnv: SystemEnv = {
      occurrencesAfterComplete: 2, // TODO: occurrencesAfterComplete move this value into configuration
      senderPAId: 'aSenderPaId', // TODO: senderPaId move this value into configuration
      downloadDocumentURL: config.server.downloadDocumentURL,
      sampleStaticPdfFileName: 'sample.pdf',
      iunGenerator: crypto.randomUUID,
      dateGenerator: () => new Date(),
      preLoadRecordRepository,
      uploadToS3RecordRepository,
      createNotificationRequestRecordRepository: newNotificationRepository,
      findNotificationRequestRecordRepository: checkNotificationStatusRepository,
      createEventStreamRecordRepository,
      consumeEventStreamRecordRepository: consumeEventStreamRepository,
      listEventStreamRecordRepository,
      getNotificationDetailRecordRepository: getNotificationDetailRepository,
      getNotificationDocumentMetadataRecordRepository,
      getPaymentNotificationMetadataRecordRepository,
      getLegalFactDownloadMetadataRecordRepository,
      uploadToS3URL: config.server.uploadToS3URL,
    };

    /* init the use cases */
    const preLoadUseCase = PreLoadUseCase(systemEnv);
    const uploadToS3UseCase = UploadToS3UseCase(systemEnv);
    const sendNotificationUseCase = SendNotificationUseCase(systemEnv);
    const createEventStreamUseCase = CreateEventStreamUseCase(systemEnv);
    const checkNotificationStatusUseCase = CheckNotificationStatusUseCase(systemEnv);
    const consumeEventStreamUseCase = ConsumeEventStreamUseCase(systemEnv);
    const listEventStreamUseCase = ListEventStreamUseCase(systemEnv);
    const getChecklistResultUseCase = GetChecklistResultUseCase(systemEnv);
    const getNotificationDetailUseCase = GetNotificationDetailUseCase(systemEnv);
    const getNotificationDocumentMetadataUseCase = GetNotificationDocumentMetadataUseCase(systemEnv);
    const getPaymentNotificationMetadataUseCase = GetPaymentNotificationMetadataUseCase(systemEnv);
    const getLegalFactDownloadMetadataUseCase = GetLegalFactDownloadMetadataUseCase(systemEnv);

    /* initialize all the driving adapters (e.g.: HTTP API ) */
    const application = http.makeApplication(
      preLoadUseCase,
      uploadToS3UseCase,
      sendNotificationUseCase,
      createEventStreamUseCase,
      checkNotificationStatusUseCase,
      getNotificationDetailUseCase,
      consumeEventStreamUseCase,
      listEventStreamUseCase,
      getChecklistResultUseCase,
      getNotificationDocumentMetadataUseCase,
      getPaymentNotificationMetadataUseCase,
      getLegalFactDownloadMetadataUseCase
    );
    http.startApplication(logger, config, application);
  }),
  E.fold(
    (error) => void makeLogger().error(error),
    (_) => _
  )
);
