import { PreLoadResponseBody } from '../generated/definitions/PreLoadResponseBody';
import { PreLoadRequestBody } from '../generated/definitions/PreLoadRequestBody';
import { ApiKey } from '../generated/definitions/ApiKey';
import { PreLoadRequest } from '../generated/definitions/PreLoadRequest';
import { HttpMethodEnum, PreLoadResponse } from '../generated/definitions/PreLoadResponse';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type PreLoadRecord = {
  type: 'PreLoadRecord';
  input: { apiKey: ApiKey; body: PreLoadRequestBody };
  output: Response<200, PreLoadResponseBody> | Response<403, UnauthorizedMessageBody>;
};

export const makePreLoadResponse = (
  key: string,
  secret: string,
  url: string,
  req: PreLoadRequest
): PreLoadResponse => ({
  preloadIdx: req.preloadIdx,
  httpMethod: HttpMethodEnum.PUT,
  secret,
  url,
  key,
});

export const makePreLoadRecord = (record: Omit<PreLoadRecord, 'type'>): PreLoadRecord => ({
  type: 'PreLoadRecord',
  ...record,
});

export type PreLoadRecordRepository = Repository<PreLoadRecord>;
