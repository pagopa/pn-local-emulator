import crypto from 'crypto';
import { CheckNotificationStatusUseCase } from '../CheckNotificationStatusUseCase';
import * as E from 'fp-ts/Either';
import * as data from '../../domain/__tests__/data';
import * as inMemory from '../../adapters/inMemory';
import { makeLogger } from '../../logger';
import { NewNotificationRecord } from '../../domain/NewNotificationRepository';
import { CheckNotificationStatusRecord } from '../../domain/CheckNotificationStatusRepository';
import { ConsumeEventStreamRecord } from '../../domain/ConsumeEventStreamRecordRepository';
import { SystemEnv } from '../../domain/SystemEnv';

const logger = makeLogger();

const makeTestSystemEnv = (): SystemEnv => ({
  occurrencesAfterComplete: 2,
  senderPAId: data.aSenderPaId,
  iunGenerator: crypto.randomUUID,
  dateGenerator: () => new Date(),
  createNotificationRequestRecordRepository: inMemory.makeRepository(logger)<NewNotificationRecord>([]),
  findNotificationRequestRecordRepository: inMemory.makeRepository(logger)<CheckNotificationStatusRecord>([]),
  consumeEventStreamRecordRepository: inMemory.makeRepository(logger)<ConsumeEventStreamRecord>([]),
});

describe('CheckNotificationStatusUseCase', () => {
  it('should return 404', async () => {
    const useCase = CheckNotificationStatusUseCase(makeTestSystemEnv());
    const input = { notificationRequestId: data.notificationId.valid };

    const expected = E.right({ statusCode: 404, returned: undefined });
    const actual = await useCase(data.apiKey.valid)(input)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the notificationId', async () => {
    const useCase = CheckNotificationStatusUseCase({
      ...makeTestSystemEnv(),
      createNotificationRequestRecordRepository: inMemory.makeRepository(logger)([
        data.newNotificationRecord,
        data.newNotificationRecordWithIdempotenceToken,
      ]),
    });
    const input = { notificationRequestId: data.notificationId.valid };

    const expected = E.right(data.checkNotificationStatusRecord.output);
    const actual = await useCase(data.apiKey.valid)(input)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the paProtocolNumber', async () => {
    const useCase = CheckNotificationStatusUseCase({
      ...makeTestSystemEnv(),
      createNotificationRequestRecordRepository: inMemory.makeRepository(logger)([
        data.newNotificationRecord,
        data.newNotificationRecordWithIdempotenceToken,
      ]),
    });
    const input = { paProtocolNumber: data.paProtocolNumber.valid };

    const expected = E.right(data.checkNotificationStatusRecord.output);
    const actual = await useCase(data.apiKey.valid)(input)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the paProtocolNumber and idempotenceToken', async () => {
    const useCase = CheckNotificationStatusUseCase({
      ...makeTestSystemEnv(),
      createNotificationRequestRecordRepository: inMemory.makeRepository(logger)([
        data.newNotificationRecord,
        data.newNotificationRecordWithIdempotenceToken,
      ]),
    });
    const input = {
      idempotenceToken: data.idempotenceToken.valid,
      paProtocolNumber: data.paProtocolNumber.valid,
    };

    const expected = E.right(data.checkNotificationStatusRecordWithIdempotenceToken.output);
    const actual = await useCase(data.apiKey.valid)(input)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return the status ACCEPTED after reaching the threshold limit', async () => {
    const useCase = CheckNotificationStatusUseCase({
      ...makeTestSystemEnv(),
      createNotificationRequestRecordRepository: inMemory.makeRepository(logger)([
        data.newNotificationRecord,
        data.newNotificationRecordWithIdempotenceToken,
      ]),
      findNotificationRequestRecordRepository: inMemory.makeRepository(logger)([
        data.checkNotificationStatusRecord,
        data.checkNotificationStatusRecord,
      ]),
      iunGenerator: () => data.aIun.valid,
    });

    const input = {
      paProtocolNumber: data.paProtocolNumber.valid,
    };

    const expected = E.right(data.checkNotificationStatusRecordAccepted.output);
    const actual = await useCase(data.apiKey.valid)(input)();

    expect(actual).toStrictEqual(expected);
  });
});
