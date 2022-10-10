import * as E from 'fp-ts/Either';
import * as data from '../../domain/__tests__/data';
import * as inMemory from '../../adapters/inMemory';
import { makeLogger } from '../../logger';
import { NewNotificationRecord } from '../../domain/NewNotificationRepository';
import { CheckNotificationStatusRecord } from '../../domain/CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord } from '../../domain/ConsumeEventStreamRecordRepository';
import { GetNotificationDetailUseCase } from '../GetNotificationDetailUseCase';
import { GetNotificationDetailRecord } from '../../domain/GetNotificationDetailRepository';

const logger = makeLogger();
const numberOfWaitingBeforeComplete = 2;

describe('GetNotificationDetailUseCase', () => {
  it('should return 404', async () => {
    const useCase = GetNotificationDetailUseCase(
      numberOfWaitingBeforeComplete,
      data.aSenderPaId,
      inMemory.makeRepository(logger)<GetNotificationDetailRecord>([]),
      inMemory.makeRepository(logger)<NewNotificationRecord>([]),
      inMemory.makeRepository(logger)<CheckNotificationStatusRecord>([]),
      inMemory.makeRepository(logger)<ConsumeEventStreamRecord>([])
    );

    const expected = E.right({ statusCode: 404, returned: undefined });
    const actual = await useCase(data.apiKey.valid)(data.aIun.valid)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200', async () => {
    const useCase = GetNotificationDetailUseCase(
      numberOfWaitingBeforeComplete,
      data.aSenderPaId,
      inMemory.makeRepository(logger)<GetNotificationDetailRecord>([]),
      inMemory.makeRepository(logger)<NewNotificationRecord>([
        data.newNotificationRecord,
        data.newNotificationRecordWithIdempotenceToken,
      ]),
      inMemory.makeRepository(logger)<CheckNotificationStatusRecord>([
        data.checkNotificationStatusRecord,
        data.checkNotificationStatusRecordAccepted,
      ]),
      inMemory.makeRepository(logger)<ConsumeEventStreamRecord>([]),
      () => data.aIun.valid,
      () => data.aDate
    );

    const expected = E.right(data.getNotificationDetailRecordAccepted.output);
    const actual = await useCase(data.apiKey.valid)(data.aIun.valid)();

    expect(actual).toStrictEqual(expected);
  });
});
