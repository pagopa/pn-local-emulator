import { CreateEventStreamRecord } from '../CreateEventStreamRecord';
import { EventTypeEnum } from '../../generated/streams/StreamCreationRequest';
import { aDate, apiKey, streamId } from './data';
import { unauthorizedResponse } from '../types';

const streamCreationRequest = {
  title: 'Stream Title',
};

const createEventStreamResponse = {
  statusCode: 200 as const,
  returned: { ...streamCreationRequest, streamId: streamId.valid, activationDate: aDate },
};

const createEventStreamRecord: CreateEventStreamRecord = {
  type: 'CreateEventStreamRecord',
  input: { apiKey: apiKey.valid, body: streamCreationRequest },
  output: createEventStreamResponse,
  loggedAt: aDate,
};

const createTimelineEventStreamRecord: CreateEventStreamRecord = {
  ...createEventStreamRecord,
  input: {
    ...createEventStreamRecord.input,
    body: { ...createEventStreamRecord.input.body, eventType: EventTypeEnum.TIMELINE },
  },
};

const unauthorizedRecord = {
  ...createEventStreamRecord,
  output: unauthorizedResponse,
};

export const CreateEventStreamRecords = {
  empty: [],
  withoutEventType: [createEventStreamRecord],
  withEventTypeTimeline: [createTimelineEventStreamRecord],
  unauthorized: [unauthorizedRecord],
};
