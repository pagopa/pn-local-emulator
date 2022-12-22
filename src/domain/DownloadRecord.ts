import * as O from 'fp-ts/Option';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Record } from './Repository';
import { Response } from './types';

export type DownloadRecord = AuditRecord & {
  type: 'DownloadRecord';
  input: { url: string };
  output: Response<200>;
};

export const isDownloadRecord = (record: Record): O.Option<DownloadRecord> =>
  record.type === 'DownloadRecord' ? O.some(record) : O.none;

export const makeDownloadRecord =
  (env: DomainEnv) =>
  (input: DownloadRecord['input']): DownloadRecord => ({
    type: 'DownloadRecord',
    input,
    loggedAt: env.dateGenerator(),
    output: { statusCode: 200 as const, returned: undefined },
  });
