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
    const { apiKey: apiKey0, iun: iun0, docIdx: docIdx0 } = data.getNotificationDocumentMetadataRecord0.input;
    const { apiKey: apiKey1, iun: iun1, docIdx: docIdx1 } = data.getNotificationDocumentMetadataRecord1.input

    const expected0 = E.right(data.getNotificationDocumentMetadataRecord0.output);
    const actual0 = await useCase(apiKey0)(iun0)(docIdx0)();

    const expected1 = E.right(data.getNotificationDocumentMetadataRecord1.output);
    const actual1 = await useCase(apiKey1)(iun1)(docIdx1)();

    expect(actual0).toStrictEqual(expected0);
    expect(actual1).toStrictEqual(expected1);
  });
});
