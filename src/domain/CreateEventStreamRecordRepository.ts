import { ApiKey } from '../generated/definitions/ApiKey';
import { StreamCreationRequest } from '../generated/streams/StreamCreationRequest';
import { StreamMetadataResponse } from '../generated/streams/StreamMetadataResponse';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type CreateEventStreamRecord = {
  type: 'CreateEventStreamRecord';
  input: { apiKey: ApiKey; body: StreamCreationRequest };
  output: Response<200, StreamMetadataResponse> | Response<403, UnauthorizedMessageBody>;
};

export type CreateEventStreamRecordRepository = Repository<CreateEventStreamRecord>;
