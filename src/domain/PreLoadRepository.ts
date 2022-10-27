import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as s from 'fp-ts/string';
import * as P from 'fp-ts/Predicate';
import { PreLoadResponseBody } from '../generated/definitions/PreLoadResponseBody';
import { PreLoadRequestBody } from '../generated/definitions/PreLoadRequestBody';
import { ApiKey } from '../generated/definitions/ApiKey';
import { PreLoadRequest } from '../generated/definitions/PreLoadRequest';
import { HttpMethodEnum, PreLoadResponse } from '../generated/definitions/PreLoadResponse';
import { AllRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { NewNotificationRecord } from './NewNotificationRepository';

export type PreLoadRecord = {
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

export const makePreLoadRecord = (record: Omit<PreLoadRecord, 'type'>): PreLoadRecord => ({
  type: 'PreLoadRecord',
  ...record,
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

const existsPreLoadRecordWithSameSha256 = (sha256: string | undefined) => (record: PreLoadRecord) =>
  pipe(
    record.input.body,
    RA.some(({ sha256: recordSha256 }) => sha256 === recordSha256)
  );

const hasSuccessfulResponse = (record: PreLoadRecord) => record.output.statusCode === 200;

const hasSameSha256UsedInPreLoadRecord =
  (newNotificationRecord: NewNotificationRecord) =>
  (preLoadRecord: PreLoadRecord): boolean =>
    pipe(
      newNotificationRecord.input.body.documents,
      RA.every(({ digests }) =>
        pipe(
          preLoadRecord.input.body,
          RA.some(({ sha256 }) => sha256 === digests.sha256)
        )
      )
    );

const hasSamePaymentDocumentSha256UsedInPreLoadRecord =
  (newNotificationRecord: NewNotificationRecord) =>
  (preLoadRecord: PreLoadRecord): boolean =>
    pipe(
      newNotificationRecord.input.body.recipients,
      RA.every(({ payment }) =>
        pipe(preLoadRecord, existsPreLoadRecordWithSameSha256(payment?.pagoPaForm?.digests.sha256))
      )
    );

export const documentsHaveSameShaOfPreLoadRecords =
  (preloadRecordList: ReadonlyArray<PreLoadRecord>) => (record: NewNotificationRecord) =>
    pipe(
      preloadRecordList,
      RA.some(
        pipe(
          hasSuccessfulResponse,
          P.and(hasSameSha256UsedInPreLoadRecord(record)),
          P.and(hasSamePaymentDocumentSha256UsedInPreLoadRecord(record))
        )
      )
    );
