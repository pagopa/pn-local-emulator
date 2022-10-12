import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
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
import { GetNotificationDocumentMetadataUseCase } from './useCases/GetNotificationDocumentMetadataUseCase';
import { GetNotificationDocumentMetadataRecord } from './domain/GetNotificationDocumentMetadataRepository';

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
    const getNotificationDocumentMetadataRecordRepository = mkRepository<GetNotificationDocumentMetadataRecord>([]);

    const numberOfWaitingBeforeComplete = 2; // TODO: numberOfWaitingBeforeComplete move this value into configuration
    const senderPaId = 'aSenderPaId'; // TODO: senderPaId move this value into configuration

    /* init the use cases */
    const preLoadUseCase = PreLoadUseCase(config.server.uploadToS3URL, preLoadRecordRepository);
    const uploadToS3UseCase = UploadToS3UseCase(uploadToS3RecordRepository);
    const sendNotificationUseCase = SendNotificationUseCase(newNotificationRepository);
    const createEventStreamUseCase = CreateEventStreamUseCase(createEventStreamRecordRepository);
    const checkNotificationStatusUseCase = CheckNotificationStatusUseCase(
      numberOfWaitingBeforeComplete,
      senderPaId,
      newNotificationRepository,
      checkNotificationStatusRepository,
      consumeEventStreamRepository
    );
    const consumeEventStreamUseCase = ConsumeEventStreamUseCase(
      numberOfWaitingBeforeComplete,
      senderPaId,
      newNotificationRepository,
      checkNotificationStatusRepository,
      consumeEventStreamRepository
    );
    const getChecklistResultUseCase = GetChecklistResultUseCase(preLoadRecordRepository, uploadToS3RecordRepository);
    const getNotificationDetailUseCase = GetNotificationDetailUseCase(
      numberOfWaitingBeforeComplete,
      senderPaId,
      getNotificationDetailRepository,
      newNotificationRepository,
      checkNotificationStatusRepository,
      consumeEventStreamRepository
    );
    const getNotificationDocumentMetadataUseCase = GetNotificationDocumentMetadataUseCase(
      numberOfWaitingBeforeComplete,
      senderPaId,
      newNotificationRepository,
      checkNotificationStatusRepository,
      consumeEventStreamRepository,
      getNotificationDocumentMetadataRecordRepository
    );

    /* initialize all the driving adapters (e.g.: HTTP API ) */
    const application = http.makeApplication(
      preLoadUseCase,
      uploadToS3UseCase,
      sendNotificationUseCase,
      createEventStreamUseCase,
      checkNotificationStatusUseCase,
      getNotificationDetailUseCase,
      consumeEventStreamUseCase,
      getChecklistResultUseCase,
      getNotificationDocumentMetadataUseCase
    );
    http.startApplication(logger, config, application);
  }),
  E.fold(
    (error) => void makeLogger().error(error),
    (_) => _
  )
);
