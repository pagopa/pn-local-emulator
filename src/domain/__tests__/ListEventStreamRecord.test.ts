import { makeListEventStreamRecord } from '../ListEventStreamRecord';
import * as data from './data';

describe('makeListEventStreamRecord', () => {
  describe('200 responses', () => {
    it('should return the correct structure', () => {
      const actual = makeListEventStreamRecord(data.makeTestSystemEnv())({
        apiKey: data.apiKey.valid,
      })([data.createEventStreamRecord]);

      const expected = {
        title: data.createEventStreamRecord.input.body.title,
        streamId: data.streamId.valid,
      };

      expect(actual.output.returned).toStrictEqual([expected]);
    });
  });
});
