import { ApiKey } from '../generated/definitions/ApiKey';
import { StreamCreationRequest } from '../generated/streams/StreamCreationRequest';
import { StreamMetadataResponse } from '../generated/streams/StreamMetadataResponse';
import { Repository } from './Repository';
import { Response } from './types';

export type CreateEventStreamRecord = {
  type: 'CreateEventStreamRecord';
  input: { apiKey: ApiKey; body: StreamCreationRequest };
  output: Response<200, StreamMetadataResponse> | Response<401>;
};

export type CreateEventStreamRecordRepository = Repository<CreateEventStreamRecord>;
