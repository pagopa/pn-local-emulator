import crypto from 'crypto';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as http from './adapters/http/application';
import * as inMemory from './adapters/inMemory';
import { parseConfig } from './config';
import { makeLogger } from './logger';
import { SystemEnv } from './useCases/SystemEnv';
import { IUNGenerator } from './adapters/randexp/IUNGenerator';

pipe(
  parseConfig(process.env),
  E.map((config) => {
    const logger = makeLogger(config.logLevel);

    const systemEnv: SystemEnv = {
      occurrencesAfterComplete: 2, // TODO: move this value into configuration and find a better name ...
      occurrencesAfterViewed: 4, // TODO: move this value into configuration and find a better name ...
      senderPAId: 'aSenderPaId', // TODO: senderPaId move this value into configuration
      retryAfterMs: 1000,
      downloadDocumentURL: config.server.downloadDocumentURL,
      sampleStaticPdfFileName: 'sample.pdf',
      notificationPrice: 100,
      iunGenerator: IUNGenerator,
      dateGenerator: () => new Date(),
      uuidGenerator: () => crypto.randomUUID(),
      recordRepository: inMemory.makeRecordRepository(logger)([]),
      uploadToS3URL: config.server.uploadToS3URL,
    };

    /* initialize all the driving adapters (e.g.: HTTP API ) */
    const application = http.makeApplication(systemEnv);
    http.startApplication(logger, config, application);
  }),
  E.fold(
    (error) => void makeLogger().error(error),
    (_) => _
  )
);
