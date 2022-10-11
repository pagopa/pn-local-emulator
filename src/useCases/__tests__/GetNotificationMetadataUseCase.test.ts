import { GetNotificationDocumentMetadataUseCase } from '../GetNotificationDocumentMetadataUseCase';
import * as E from 'fp-ts/Either';
import * as data from '../../domain/__tests__/data';
import * as inMemory from '../../adapters/inMemory';
import { makeLogger } from '../../logger';
import { NewNotificationRecord } from '../../domain/NewNotificationRepository';
import { CheckNotificationStatusRecord } from '../../domain/CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord } from '../../domain/ConsumeEventStreamRecordRepository';
import { GetNotificationDocumentMetadataRecord } from '../../domain/GetNotificationDocumentMetadataRepository';

const logger = makeLogger();
const occurrencesAfterComplete = 2;

describe('GetNotificationStatusUseCase', () => {
  it('should return 404', async () => {
    const useCase = GetNotificationDocumentMetadataUseCase(
      occurrencesAfterComplete,
      data.aSenderPaId,
      inMemory.makeRepository(logger)<NewNotificationRecord>([]),
      inMemory.makeRepository(logger)<CheckNotificationStatusRecord>([]),
      inMemory.makeRepository(logger)<ConsumeEventStreamRecord>([]),
      inMemory.makeRepository(logger)<GetNotificationDocumentMetadataRecord>([])
    );

    const expected = E.right({ statusCode: 404, returned: undefined });
    const actual = await useCase(data.apiKey.valid)(data.aIun.valid)(0)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the iun and the docIdx', async () => {
    const useCase = GetNotificationDocumentMetadataUseCase(
      occurrencesAfterComplete,
      data.aSenderPaId,
      inMemory.makeRepository(logger)<NewNotificationRecord>([
        data.newNotificationRecord,
        data.newNotificationRecordWithIdempotenceToken,
      ]),
      inMemory.makeRepository(logger)<CheckNotificationStatusRecord>([
        data.checkNotificationStatusRecord,
        data.checkNotificationStatusRecordAccepted,
      ]),
      inMemory.makeRepository(logger)<ConsumeEventStreamRecord>([]),
      inMemory.makeRepository(logger)<GetNotificationDocumentMetadataRecord>([])
    );

    const expected = E.right(data.getNotificationDocumentMetadataRecord.output);
    const actual = await useCase(data.apiKey.valid)(data.aIun.valid)(0)();

    expect(actual).toStrictEqual(expected);
  });

});
