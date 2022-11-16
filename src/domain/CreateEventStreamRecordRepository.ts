import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
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

export const hasTimelineEventTypeToTimeline = (record: CreateEventStreamRecord) =>
  record.input.body.eventType === EventTypeEnum.TIMELINE;

export const isSuccessfulResponse = (record: CreateEventStreamRecord) => record.output.statusCode === 200;

export const existsCreateEventStreamRecordWhitStreamId =
  (records: ReadonlyArray<CreateEventStreamRecord>) => (streamId: string) =>
    pipe(
      records,
      // TODO: Find a way to use the isSuccessfulResponse above. At the moment, if we use it, it doesn't compile if we try to get the streamId from the returned
      RA.filterMap((record) => (record.output.statusCode === 200 ? O.some(record.output) : O.none)),
      RA.exists(({ returned }) => returned.streamId === streamId)
    );
