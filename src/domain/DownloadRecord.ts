import { DomainEnv } from './DomainEnv';
import { AuditRecord } from './Repository';
import { Response } from './types';

export type DownloadRecord = AuditRecord & {
  type: 'DownloadRecord';
  input: { url: string };
  output: Response<200>;
};

export const makeDownloadRecord =
  (env: DomainEnv) =>
  (input: DownloadRecord['input']): DownloadRecord => ({
    type: 'DownloadRecord',
    input,
    loggedAt: env.dateGenerator(),
    output: { statusCode: 200 as const, returned: undefined },
  });
