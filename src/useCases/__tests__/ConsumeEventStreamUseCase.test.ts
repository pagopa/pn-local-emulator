import { ConsumeEventStreamUseCase } from '../ConsumeEventStreamUseCase';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as inMemory from '../../adapters/inMemory';
import * as data from '../../domain/__tests__/data';
import { makeLogger } from '../../logger';
import { NewNotificationRecord } from '../../domain/NewNotificationRepository';
import { ConsumeEventStreamRecord } from '../../domain/ConsumeEventStreamRecordRepository';
import { CheckNotificationStatusRecord } from '../../domain/CheckNotificationStatusRepository';

const numberOfWaitingBeforeComplete = 2;

describe('ConsumeEventStreamUseCase', () => {
  describe('200 response', () => {
    it('should return empty array', async () => {
      const useCase = ConsumeEventStreamUseCase(
        numberOfWaitingBeforeComplete,
        inMemory.makeRepository(makeLogger())<ConsumeEventStreamRecord>([]),
        inMemory.makeRepository(makeLogger())<NewNotificationRecord>([]),
        inMemory.makeRepository(makeLogger())<CheckNotificationStatusRecord>([])
      );

      const actual = await useCase(data.apiKey.valid)(data.streamId.valid)(undefined)();

      expect(actual).toStrictEqual(E.right({ statusCode: 200 as const, returned: [] }));
    });
    it('should return waiting status', async () => {
      const useCase = ConsumeEventStreamUseCase(
        numberOfWaitingBeforeComplete,
        inMemory.makeRepository(makeLogger())<ConsumeEventStreamRecord>([]),
        inMemory.makeRepository(makeLogger())<NewNotificationRecord>([data.newNotificationRecord]),
        inMemory.makeRepository(makeLogger())<CheckNotificationStatusRecord>([]),
        () => data.aDate
      );

      const actual = await useCase(data.apiKey.valid)(data.streamId.valid)(undefined)();

      expect(actual).toStrictEqual(E.right(data.consumeEventStreamResponse));
    });

    it('should return delivery status after reaching the threshold limit', async () => {
      const useCase = ConsumeEventStreamUseCase(
        numberOfWaitingBeforeComplete,
        inMemory.makeRepository(makeLogger())<ConsumeEventStreamRecord>([
          data.consumeEventStreamRecord,
          data.consumeEventStreamRecord,
        ]),
        inMemory.makeRepository(makeLogger())<NewNotificationRecord>([data.newNotificationRecord]),
        inMemory.makeRepository(makeLogger())<CheckNotificationStatusRecord>([]),
        () => data.aDate,
        () => data.aIun.valid
      );

      const actual = await useCase(data.apiKey.valid)(data.streamId.valid)(undefined)();

      expect(actual).toStrictEqual(E.right(data.consumeEventStreamRecordDelivered.output));
    });
    it('should return last delivered response if any', async () => {
      const useCase = ConsumeEventStreamUseCase(
        numberOfWaitingBeforeComplete,
        inMemory.makeRepository(makeLogger())<ConsumeEventStreamRecord>([
          data.consumeEventStreamRecord,
          data.consumeEventStreamRecordDelivered,
        ]),
        inMemory.makeRepository(makeLogger())<NewNotificationRecord>([data.newNotificationRecord]),
        inMemory.makeRepository(makeLogger())<CheckNotificationStatusRecord>([]),
        () => data.aDate,
        () => data.aIun.valid
      );

      const actual = await useCase(data.apiKey.valid)(data.streamId.valid)(undefined)();

      expect(actual).toStrictEqual(E.right(data.consumeEventStreamRecordDelivered.output));
    });
    it('should paginate correctly', async () => {
      const notificationIdList = RA.makeBy(10, (i) => i.toString());
      const records = pipe(
        notificationIdList,
        RA.map((nId) => ({
          ...data.newNotificationRecord,
          output: {
            statusCode: 202 as const,
            returned: {
              paProtocolNumber: nId,
              notificationRequestId: nId,
            },
          },
        }))
      );
      const useCase = ConsumeEventStreamUseCase(
        numberOfWaitingBeforeComplete,
        inMemory.makeRepository(makeLogger())<ConsumeEventStreamRecord>([]),
        inMemory.makeRepository(makeLogger())<NewNotificationRecord>(records),
        inMemory.makeRepository(makeLogger())<CheckNotificationStatusRecord>([]),
        () => data.aDate,
        () => data.aIun.valid
      );

      const actual0 = await useCase(data.apiKey.valid)(data.streamId.valid)(undefined)();
      const actual1 = await useCase(data.apiKey.valid)(data.streamId.valid)(notificationIdList[7])();

      const getNotificationRequestId = (output: ConsumeEventStreamRecord['output']) =>
        pipe(
          output.statusCode === 200 ? output.returned : RA.empty,
          RA.filterMap(({ notificationRequestId }) => O.fromNullable(notificationRequestId))
        );

      expect(pipe(actual0, E.map(getNotificationRequestId))).toStrictEqual(E.right(notificationIdList));
      expect(pipe(actual1, E.map(getNotificationRequestId))).toStrictEqual(E.right(notificationIdList.slice(8)));
    });
  });
});
