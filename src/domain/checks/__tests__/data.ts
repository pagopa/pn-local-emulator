import * as data from '../../__tests__/data';
import { EventTypeEnum } from '../../../generated/streams/StreamCreationRequest';
import { unauthorizedResponse } from '../../types';

// TODO: Refactor using fast-check
export const preLoadRecordSingletonList = [data.preLoadRecord];

export const preLoadRecords = [data.preLoadRecord, data.preLoadRecord];

export const twoPreLoadRecordsOneUploadRecord = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record];

export const evenPreLoadAndUploadRecordsThatAreLinked = [
  data.preLoadRecord,
  data.preLoadRecord,
  data.uploadToS3Record,
  data.uploadToS3Record,
];

export const evenPreLoadAndUploadRecordsThatAreNotLinked = [
  data.preLoadRecord,
  data.preLoadRecord,
  data.uploadToS3Record,
  data.uploadToS3RecordDangling,
];

export const createEventStreamRecordWithoutEventType = [data.createEventStreamRecord];
export const createEventStreamRecordWithEventTypeTimeline = [
  {
    ...data.createEventStreamRecord,
    input: {
      ...data.createEventStreamRecord.input,
      body: { ...data.createEventStreamRecord.input.body, eventType: EventTypeEnum.TIMELINE },
    },
  },
];

export const failedRequestCreateEventStream = [
  {
    ...createEventStreamRecordWithEventTypeTimeline[0],
    output: unauthorizedResponse,
  },
];

export const consumeEventStreamRecordWithAcceptedEvent = [
  {
    ...data.consumeEventStreamRecord,
    output: {
      statusCode: 200 as const,
      returned: [data.acceptedEvent],
    },
  },
];

export const consumeEventStreamRecordWithInValidationEvent = [
  {
    ...data.consumeEventStreamRecord,
    output: {
      statusCode: 200 as const,
      returned: [data.inValidationEvent],
    },
  },
];

export const consumeEventsOnCreatedStream = [
  ...createEventStreamRecordWithEventTypeTimeline,
  ...consumeEventStreamRecordWithAcceptedEvent,
];

export const consumeEventsOnCreatedStreamWithOnlyInValidationEvent = [
  ...createEventStreamRecordWithEventTypeTimeline,
  ...consumeEventStreamRecordWithInValidationEvent,
];
