import * as E from 'fp-ts/Either';
import * as data from '../../domain/__tests__/data';
import * as inMemory from '../../adapters/inMemory';
import { makeLogger } from '../../logger';
import { NewNotificationRecord } from '../../domain/NewNotificationRepository';
import { CheckNotificationStatusRecord } from '../../domain/CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord } from '../../domain/ConsumeEventStreamRecordRepository';
import { GetPaymentNotificationMetadataUseCase } from '../GetPaymentNotificationMetadataUseCase';
import { GetPaymentNotificationMetadataRecord } from '../../domain/GetPaymentNotificationMetadataRepository';

const logger = makeLogger();
const occurrencesAfterComplete = 2;

describe('GetPaymentNotificationMetadataUseCase', () => {
  it('should return 404', async () => {
    const useCase = GetPaymentNotificationMetadataUseCase(
      occurrencesAfterComplete,
      data.aSenderPaId,
      inMemory.makeRepository(logger)<NewNotificationRecord>([]),
      inMemory.makeRepository(logger)<CheckNotificationStatusRecord>([]),
      inMemory.makeRepository(logger)<ConsumeEventStreamRecord>([]),
      inMemory.makeRepository(logger)<GetPaymentNotificationMetadataRecord>([])
    );

    const expected = E.right({ statusCode: 404, returned: undefined });
    const actual = await useCase(data.apiKey.valid)(data.aIun.valid)(0)('PAGOPA')();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the iun, the recipient id and the attachment name', async () => {
    const useCase = GetPaymentNotificationMetadataUseCase(
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
      inMemory.makeRepository(logger)<GetPaymentNotificationMetadataRecord>([])
    );
    const { apiKey, iun, recipientId } = data.getPaymentNotificationMetadataRecord.input;

    const expected = E.right(data.getPaymentNotificationMetadataRecord.output);
    // FIXME: The 'key' should be one of PAGOPA, F24_FLAT and F24_STANDARD
    const actual = await useCase(apiKey)(iun)(recipientId)('key')();

    expect(actual).toStrictEqual(expected);
  });
});
