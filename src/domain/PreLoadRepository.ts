import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as s from 'fp-ts/string';
import { PreLoadResponseBody } from '../generated/definitions/PreLoadResponseBody';
import { PreLoadRequestBody } from '../generated/definitions/PreLoadRequestBody';
import { ApiKey } from '../generated/definitions/ApiKey';
import { PreLoadRequest } from '../generated/definitions/PreLoadRequest';
import { HttpMethodEnum, PreLoadResponse } from '../generated/definitions/PreLoadResponse';
import { AllRecord, AuditRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type PreLoadRecord = AuditRecord & {
  type: 'PreLoadRecord';
  input: { apiKey: ApiKey; body: PreLoadRequestBody };
  output: Response<200, PreLoadResponseBody> | Response<403, UnauthorizedMessageBody>;
};

export const isPreLoadRecord = (record: AllRecord): O.Option<PreLoadRecord> =>
  record.type === 'PreLoadRecord' ? O.some(record) : O.none;

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

export type PreLoadRecordRepository = Repository<PreLoadRecord>;

export const hasUniquePreloadIdx = (record: PreLoadRecord) =>
  pipe(
    record.input.body,
    RA.map((elem) => elem.preloadIdx),
    RA.uniq(s.Eq),
    (unique) => unique.length === record.input.body.length
  );

export const hasApplicationPdfAsContentType = (record: PreLoadRecord) =>
  pipe(
    record.input.body,
    RA.every(({ contentType }) => contentType === 'application/pdf')
  );
