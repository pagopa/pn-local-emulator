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

pipe(
  parseConfig(process.env),
  E.map((config) => {
    const logger = makeLogger();
    /* put here the driven adapters (e.g.: Repositories ) */
    const preLoadRecordRepository = inMemory.makeRepository(logger)([]);
    const uploadToS3RecordRepository = inMemory.makeRepository(logger)([]);
    const newNotificationRepository = inMemory.makeRepository(logger)([]);
    const createEventStreamRecordRepository = inMemory.makeRepository(logger)([]);
    const checkNotificationStatusRepository = inMemory.makeRepository(logger)([]);
    /* init the use cases */
    const preLoadUseCase = PreLoadUseCase(config.server.uploadToS3URL, preLoadRecordRepository);
    const uploadToS3UseCase = UploadToS3UseCase(uploadToS3RecordRepository);
    const sendNotificationUseCase = SendNotificationUseCase(newNotificationRepository);
    const createEventStreamUseCase = CreateEventStreamUseCase(createEventStreamRecordRepository);
    const checkNotificationStatusUseCase = CheckNotificationStatusUseCase(
      newNotificationRepository,
      checkNotificationStatusRepository
    );
    const getChecklistResultUseCase = GetChecklistResultUseCase(preLoadRecordRepository);

    /* initialize all the driving adapters (e.g.: HTTP API ) */
    const application = http.makeApplication(
      preLoadUseCase,
      uploadToS3UseCase,
      sendNotificationUseCase,
      createEventStreamUseCase,
      checkNotificationStatusUseCase,
      getChecklistResultUseCase
    );
    http.startApplication(logger, config, application);
  }),
  E.fold(
    (error) => void makeLogger().error(error),
    (_) => _
  )
);
