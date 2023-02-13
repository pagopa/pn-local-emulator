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
  });

  describe('403 response', () => {
    it('should return a 403 response', () => {
      const inputWithBadApiKey = { ...data.consumeEventStreamRecord.input, apiKey: data.apiKey.invalid };
      const actual = makeConsumeEventStreamRecord(data.makeTestSystemEnv())(inputWithBadApiKey)([]);
      expect(actual.output.statusCode).toStrictEqual(403);
    });
  });
});
