import { makeConsumeEventStreamRecord } from '../ConsumeEventStreamRecord';
import * as data from './data';

describe('makeConsumeEventStreamRecord', () => {
  describe('200 responses', () => {
    it('should return an empty array', () => {
      const actual = makeConsumeEventStreamRecord(data.makeTestSystemEnv())(data.consumeEventStreamRecord.input)([]);
      expect(actual.output.statusCode).toStrictEqual(200);
      expect(actual.output.returned).toStrictEqual([]);
    });

    it('should return an event', () => {
      const actual = makeConsumeEventStreamRecord(data.makeTestSystemEnv())(data.consumeEventStreamRecord.input)([
        data.newNotificationRecord,
      ]);
      expect(actual.output.statusCode).toStrictEqual(200);
      expect(actual.output.returned).toStrictEqual(data.consumeEventStreamResponse.returned);
    });

    it('should return an event with a delivery status', () => {
      const actual = makeConsumeEventStreamRecord(data.makeTestSystemEnv())(data.consumeEventStreamRecord.input)([
        data.newNotificationRecord,
        data.consumeEventStreamRecord,
        data.consumeEventStreamRecord,
      ]);
      expect(actual.output.statusCode).toStrictEqual(200);
      expect(actual.output.returned).toStrictEqual(data.consumeEventStreamRecordDelivered.output.returned);
    });

    it('should return last delivered response if any', () => {
      const actual = makeConsumeEventStreamRecord(data.makeTestSystemEnv())(data.consumeEventStreamRecord.input)([
        data.newNotificationRecord,
        data.consumeEventStreamRecord,
        data.consumeEventStreamRecordDelivered,
      ]);
      expect(actual.output.statusCode).toStrictEqual(200);
      expect(actual.output.returned).toStrictEqual(data.consumeEventStreamRecordDelivered.output.returned);
    });
  });

  describe('403 response', () => {
    it('should return a 403 response', () => {
      const inputWithBadApiKey = { ...data.consumeEventStreamRecord.input, apiKey: data.apiKey.invalid };
      const actual = makeConsumeEventStreamRecord(data.makeTestSystemEnv())(inputWithBadApiKey)([]);
      expect(actual.output.statusCode).toStrictEqual(403);
    });
  });
});
