import {
  existsCreateEventStreamRecordWhitStreamId,
  hasTimelineEventTypeToTimeline,
} from '../CreateEventStreamRecordRepository';
import * as data from './data';
import { unauthorizedResponse } from '../types';
import { EventTypeEnum } from '../../generated/streams/StreamCreationRequest';

describe('CreateEventStreamRecordRepository', () => {
  describe('hasTimelineEventTypeToTimeline', () => {
    it('should be true that the event type is timeline', () => {
      const record = {
        ...data.createEventStreamRecord,
        input: {
          ...data.createEventStreamRecord.input,
          body: { ...data.createEventStreamRecord.input.body, eventType: EventTypeEnum.TIMELINE },
        },
      };
      const actual = hasTimelineEventTypeToTimeline(record);
      expect(actual).toStrictEqual(true);
    });

    it('should be false that the event type is timeline', () => {
      const actual = hasTimelineEventTypeToTimeline(data.createEventStreamRecord);
      expect(actual).toStrictEqual(false);
    });
  });

  describe('existsCreateEventStreamRecordWhitStreamId', () => {
    const streamId = data.streamId.valid;
    it('should find a record with the provided streamId', () => {
      const actual = existsCreateEventStreamRecordWhitStreamId([data.createEventStreamRecord])(streamId);
      expect(actual).toStrictEqual(true);

      const actual2 = existsCreateEventStreamRecordWhitStreamId([
        { ...data.createEventStreamRecord, output: unauthorizedResponse },
        data.createEventStreamRecord,
      ])(streamId);
      expect(actual2).toStrictEqual(true);
    });

    it('should find a record with the provided streamId', () => {
      const actual = existsCreateEventStreamRecordWhitStreamId([])(streamId);
      expect(actual).toStrictEqual(false);

      const actual2 = existsCreateEventStreamRecordWhitStreamId([data.createEventStreamRecord])('anotherStreamId');
      expect(actual2).toStrictEqual(false);

      const actual3 = existsCreateEventStreamRecordWhitStreamId([
        { ...data.createEventStreamRecord, output: unauthorizedResponse },
      ])(streamId);
      expect(actual3).toStrictEqual(false);
    });
  });
});
