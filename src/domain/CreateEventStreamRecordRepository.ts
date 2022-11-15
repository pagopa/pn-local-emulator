import * as O from 'fp-ts/Option';
import { ApiKey } from '../generated/definitions/ApiKey';
import { EventTypeEnum, StreamCreationRequest } from '../generated/streams/StreamCreationRequest';
import { StreamMetadataResponse } from '../generated/streams/StreamMetadataResponse';
import { AllRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type CreateEventStreamRecord = {
  type: 'CreateEventStreamRecord';
  input: { apiKey: ApiKey; body: StreamCreationRequest };
  output: Response<200, StreamMetadataResponse> | Response<403, UnauthorizedMessageBody>;
};

export type CreateEventStreamRecordRepository = Repository<CreateEventStreamRecord>;

export const isCreateEventStreamRecord = (record: AllRecord): O.Option<CreateEventStreamRecord> =>
  record.type === 'CreateEventStreamRecord' ? O.some(record) : O.none;

// TODO: Add missing unit tests
export const hasTimelineEventTypeToTimeline = (record: CreateEventStreamRecord) =>
  record.input.body.eventType === EventTypeEnum.TIMELINE;

export const isSuccessfulResponse = (record: CreateEventStreamRecord) => record.output.statusCode === 200;
