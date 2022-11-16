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

export const consumeEventStreamRecord = [data.consumeEventStreamRecord];

export const consumeEventsOnCreatedStream = [
  ...createEventStreamRecordWithEventTypeTimeline,
  ...consumeEventStreamRecord,
];
