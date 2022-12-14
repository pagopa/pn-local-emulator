import * as O from 'fp-ts/Option';
import { identity, pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { HttpMethodEnum, PreLoadResponse } from '../generated/pnapi/PreLoadResponse';
import { PreLoadBulkRequest } from '../generated/pnapi/PreLoadBulkRequest';
import { Problem } from '../generated/pnapi/Problem';
import { Record, AuditRecord } from './Repository';
import { Response } from './types';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';

export type PreLoadRecord = AuditRecord & {
  type: 'PreLoadRecord';
  input: { apiKey: string; body: PreLoadBulkRequest };
  output: Response<200, ReadonlyArray<PreLoadResponse>> | Response<403, Problem>;
};

export const isPreLoadRecord = (record: Record): O.Option<PreLoadRecord> =>
  record.type === 'PreLoadRecord' ? O.some(record) : O.none;

const makeURL = (baseUrl: string, key: string) => {
  const url = new URL(`${baseUrl}/${key}`);
  url.searchParams.append('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  url.searchParams.append('X-Amz-Credential', 'AKIDEXAMPLE/20150830/us-east-1/iam/aws4_request');
  url.searchParams.append('X-Amz-SignedHeaders', 'content-type;host;x-amz-checksum-sha256;x-amz-meta-secret');
  url.searchParams.append('X-Amz-Security-Token', 'IQoJbJf//////////wEaCmV1i3c+bxI+JMzP+PRXYj/e2G/ti/Qkj3KnOPr');
  return url.href;
};

export const makePreLoadRecord =
  (env: DomainEnv) =>
  (input: PreLoadRecord['input']): PreLoadRecord => ({
    type: 'PreLoadRecord',
    input,
    loggedAt: env.dateGenerator(),
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.foldW(identity, () => ({
        statusCode: 200,
        returned: pipe(
          input.body,
          RA.map((preLoadRequest) => ({
            preloadIdx: preLoadRequest.preloadIdx,
            secret: env.iunGenerator(),
            httpMethod: HttpMethodEnum.PUT,
            key: env.iunGenerator(),
          })),
          RA.map((preLoadRecord) => ({
            ...preLoadRecord,
            url: makeURL(env.uploadToS3URL.href, preLoadRecord.key),
          }))
        ),
      }))
    ),
  });
