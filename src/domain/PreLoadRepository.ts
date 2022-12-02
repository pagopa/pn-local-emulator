import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { HttpMethodEnum, PreLoadResponse } from '../generated/pnapi/PreLoadResponse';
import { PreLoadBulkRequest } from '../generated/pnapi/PreLoadBulkRequest';
import { Problem } from '../generated/pnapi/Problem';
import { ApiKey } from '../generated/definitions/ApiKey';
import { AllRecord, AuditRecord, Repository } from './Repository';
import { Response, unauthorizedResponse } from './types';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';

export type PreLoadRecord = AuditRecord & {
  type: 'PreLoadRecord';
  input: { apiKey: ApiKey; body: PreLoadBulkRequest };
  output: Response<200, ReadonlyArray<PreLoadResponse>> | Response<403, Problem>;
};

export const isPreLoadRecord = (record: AllRecord): O.Option<PreLoadRecord> =>
  record.type === 'PreLoadRecord' ? O.some(record) : O.none;

export type PreLoadRecordRepository = Repository<PreLoadRecord>;

const makeURL = (baseUrl: string, key: string) => {
  const url = new URL(`${baseUrl}/${key}`);
  url.searchParams.append('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  url.searchParams.append('X-Amz-Credential', 'AKIDEXAMPLE/20150830/us-east-1/iam/aws4_request');
  url.searchParams.append('X-Amz-SignedHeaders', 'content-type;host;x-amz-checksum-sha256;x-amz-meta-secret');
  url.searchParams.append('X-Amz-Security-Token', 'IQoJbJf//////////wEaCmV1i3c+bxI+JMzP+PRXYj/e2G/ti/Qkj3KnOPr');
  return url.href;
};

type Args = DomainEnv & Pick<PreLoadRecord, 'input'>;

export const makePreLoadRecord = (args: Args): PreLoadRecord => ({
  type: 'PreLoadRecord',
  input: args.input,
  loggedAt: args.dateGenerator(),
  output: pipe(
    authorizeApiKey(args.input.apiKey),
    E.foldW(
      () => unauthorizedResponse,
      () => ({
        statusCode: 200,
        returned: pipe(
          args.input.body,
          RA.map((preLoadRequest) => ({
            preloadIdx: preLoadRequest.preloadIdx,
            secret: args.iunGenerator(),
            httpMethod: HttpMethodEnum.PUT,
            key: args.iunGenerator(),
          })),
          RA.map((preLoadRecord) => ({
            ...preLoadRecord,
            url: makeURL(args.uploadToS3URL.href, preLoadRecord.key),
          }))
        ),
      })
    )
  ),
});
