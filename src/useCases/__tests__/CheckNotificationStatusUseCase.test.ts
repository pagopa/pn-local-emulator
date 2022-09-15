import { CheckNotificationStatusUseCase } from '../CheckNotificationStatusUseCase';
import * as E from 'fp-ts/Either';
import * as data from '../../domain/__tests__/data';
import * as inMemory from '../../adapters/inMemory';
import { makeLogger } from '../../logger';

const logger = makeLogger();

describe('CheckNotificationStatusUseCase', () => {
  it('should return 404', async () => {
    const useCase = CheckNotificationStatusUseCase(
      inMemory.makeRepository(logger)([]),
      inMemory.makeRepository(logger)([])
    );
    const input = { notificationRequestId: data.notificationId.valid };

    const expected = E.right({ statusCode: 404, returned: undefined });
    const actual = await useCase(data.apiKey.valid)(input)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the notificationId', async () => {
    const useCase = CheckNotificationStatusUseCase(
      inMemory.makeRepository(logger)([data.newNotificationRecord, data.newNotificationRecordWithIdempotenceToken]),
      inMemory.makeRepository(logger)([])
    );
    const input = { notificationRequestId: data.notificationId.valid };

    const expected = E.right(data.checkNotificationStatusRecord.output);
    const actual = await useCase(data.apiKey.valid)(input)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the paProtocolNumber', async () => {
    const useCase = CheckNotificationStatusUseCase(
      inMemory.makeRepository(logger)([data.newNotificationRecord, data.newNotificationRecordWithIdempotenceToken]),
      inMemory.makeRepository(logger)([])
    );
    const input = { paProtocolNumber: data.paProtocolNumber.valid };

    const expected = E.right(data.checkNotificationStatusRecord.output);
    const actual = await useCase(data.apiKey.valid)(input)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the paProtocolNumber and idempotenceToken', async () => {
    const useCase = CheckNotificationStatusUseCase(
      inMemory.makeRepository(logger)([data.newNotificationRecord, data.newNotificationRecordWithIdempotenceToken]),
      inMemory.makeRepository(logger)([])
    );
    const input = {
      idempotenceToken: data.idempotenceToken.valid,
      paProtocolNumber: data.paProtocolNumber.valid,
    };

    const expected = E.right(data.checkNotificationStatusRecordWithIdempotenceToken.output);
    const actual = await useCase(data.apiKey.valid)(input)();

    expect(actual).toStrictEqual(expected);
  });
});
