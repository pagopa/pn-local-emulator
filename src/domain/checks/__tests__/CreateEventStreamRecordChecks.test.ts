import * as CreateEventStreamRecordChecks from '../CreateEventStreamRecordChecks';
import * as data from '../../__tests__/data';
import { unauthorizedResponse } from '../../types';

describe('CreateEventStreamRecordChecks', () => {
  it('hasCreatedStreamWithEventTypeTimelineC', () => {
    const check = CreateEventStreamRecordChecks.hasCreatedStreamWithEventTypeTimelineC;
    expect(check([])).toStrictEqual(false);
    expect(check([data.createEventStreamRecord])).toStrictEqual(false);
    expect(
      check([
        {
          ...data.createEventStreamRecord,
          output: unauthorizedResponse,
        },
      ])
    ).toStrictEqual(false);
    expect(check([data.createTimelineEventStreamRecord])).toStrictEqual(true);
  });
});
