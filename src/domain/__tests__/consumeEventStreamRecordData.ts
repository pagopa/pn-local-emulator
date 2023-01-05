import { NewStatusEnum } from '../../generated/streams/ProgressResponseElement';
import { ConsumeEventStreamRecord } from '../ConsumeEventStreamRecord';
import * as data from './data';
import { CreateEventStreamRecords } from './createEventStreamRecordData';
import { unauthorizedResponse } from '../types';

const baseConsumeEventStreamResponse: ConsumeEventStreamRecord['output'] = {
  statusCode: 200 as const,
  headers: { 'retry-after': data.aRetryAfterMs },
  returned: [
    {
      eventId: '0',
      timestamp: data.aDate,
      notificationRequestId: data.notificationId.valid,
    },
  ],
};

const baseConsumeEventStreamRecord: ConsumeEventStreamRecord = {
  type: 'ConsumeEventStreamRecord',
  input: { apiKey: data.apiKey.valid, streamId: data.streamId.valid },
  output: baseConsumeEventStreamResponse,
  loggedAt: data.aDate,
};

const unauthorizedRecord = {
  ...baseConsumeEventStreamRecord,
  output: unauthorizedResponse,
};

const inValidationEvent = {
  eventId: '1',
  timestamp: data.aDate,
  notificationRequestId: data.notificationId.valid,
  newStatus: NewStatusEnum.IN_VALIDATION,
};

const consumeEventStreamRecordInValidation = {
  ...baseConsumeEventStreamRecord,
  output: {
    ...baseConsumeEventStreamResponse,
    returned: [inValidationEvent],
  }
}

const consumeEventStreamRecordAccepted = {
  ...baseConsumeEventStreamRecord,
  output: {
    ...baseConsumeEventStreamResponse,
    returned: baseConsumeEventStreamResponse.returned.map((returned) => ({
      ...returned,
      newStatus: NewStatusEnum.ACCEPTED,
      iun: data.aIun.valid,
    })),
  },
};

const consumeEventStreamRecordAcceptedAndDelayed = {
  ...consumeEventStreamRecordAccepted,
  loggedAt: new Date(data.aDate.getTime() + 2000),
};

export const ConsumeEventStreamRecords = {
  empty: [],
  withAcceptedEvent: [consumeEventStreamRecordAccepted, ...CreateEventStreamRecords.withEventTypeTimeline],
  withAcceptedAndDelayedEvent: [consumeEventStreamRecordAcceptedAndDelayed],
  withInValidationEvent: [consumeEventStreamRecordInValidation],
  onlyConsumeRecords: [baseConsumeEventStreamRecord],
  onlyCreateRecords: [...CreateEventStreamRecords.withoutEventType],
  unauthorized: [unauthorizedRecord],
};
