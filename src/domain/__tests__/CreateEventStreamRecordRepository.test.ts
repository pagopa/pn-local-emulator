import { hasTimelineEventTypeToTimeline, isSuccessfulResponse } from '../CreateEventStreamRecordRepository';
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

  describe('isSuccessfulResponse', () => {
    it('should be true that request completes successfully', () => {
      const actual = isSuccessfulResponse(data.createEventStreamRecord);
      expect(actual).toStrictEqual(true);
    });

    it('should be false that request completes successfully', () => {
      const actual = isSuccessfulResponse({
        ...data.createEventStreamRecord,
        output: unauthorizedResponse,
      });
      expect(actual).toStrictEqual(false);
    });
  });
});
