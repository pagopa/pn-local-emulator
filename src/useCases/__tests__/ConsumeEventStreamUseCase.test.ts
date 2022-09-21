import { ConsumeEventStreamUseCase } from '../ConsumeEventStreamUseCase';
import * as E from 'fp-ts/Either';
import * as inMemory from '../../adapters/inMemory';
import * as data from '../../domain/__tests__/data';
import { makeLogger } from '../../logger';
import { NewNotificationRecord } from '../../domain/NewNotificationRepository';
import { ConsumeEventStreamRecord } from '../../domain/ConsumeEventStreamRecordRepository';
import { NewStatusEnum } from '../../generated/streams/ProgressResponseElement';

const minNumberOfWaitingBeforeDelivering = 2;

describe('ConsumeEventStreamUseCase', () => {
  describe('200 response', () => {
    it('should return empty array', async () => {
      const useCase = ConsumeEventStreamUseCase(
        minNumberOfWaitingBeforeDelivering,
        inMemory.makeRepository(makeLogger())<ConsumeEventStreamRecord>([]),
        inMemory.makeRepository(makeLogger())<NewNotificationRecord>([])
      );

      const actual = await useCase(data.apiKey.valid)(data.streamId.valid)(undefined)();

      expect(actual).toStrictEqual(E.right({ statusCode: 200 as const, returned: [] }));
    });
    it('should return waiting status', async () => {
      const useCase = ConsumeEventStreamUseCase(
        minNumberOfWaitingBeforeDelivering,
        inMemory.makeRepository(makeLogger())<ConsumeEventStreamRecord>([]),
        inMemory.makeRepository(makeLogger())<NewNotificationRecord>([data.newNotificationRecord]),
        () => data.aDate
      );

      const actual = await useCase(data.apiKey.valid)(data.streamId.valid)(undefined)();

      expect(actual).toStrictEqual(E.right(data.consumeEventStreamResponse));
    });

    it('should return delivery status after reaching the threshold limit', async () => {
      const useCase = ConsumeEventStreamUseCase(
        minNumberOfWaitingBeforeDelivering,
        inMemory.makeRepository(makeLogger())<ConsumeEventStreamRecord>([
          data.consumeEventStreamRecord,
          data.consumeEventStreamRecord,
        ]),
        inMemory.makeRepository(makeLogger())<NewNotificationRecord>([data.newNotificationRecord]),
        () => data.aDate,
        () => data.aIun.valid
      );

      const actual = await useCase(data.apiKey.valid)(data.streamId.valid)(undefined)();

      expect(actual).toStrictEqual(E.right(data.consumeEventStreamRecordDelivered.output));
    });
    it('should last delivered response if any', async () => {
      const useCase = ConsumeEventStreamUseCase(
        minNumberOfWaitingBeforeDelivering,
        inMemory.makeRepository(makeLogger())<ConsumeEventStreamRecord>([
          data.consumeEventStreamRecord,
          data.consumeEventStreamRecordDelivered,
        ]),
        inMemory.makeRepository(makeLogger())<NewNotificationRecord>([data.newNotificationRecord]),
        () => data.aDate,
        () => data.aIun.valid
      );

      const actual = await useCase(data.apiKey.valid)(data.streamId.valid)(undefined)();

      expect(actual).toStrictEqual(E.right(data.consumeEventStreamRecordDelivered.output));
    });
  });
});
