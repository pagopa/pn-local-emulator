import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import { AuditRecord } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { authorizeApiKey } from './authorize';

export type DeleteStreamRecord = AuditRecord & {
  type: 'DeleteStreamRecord';
  input: { apiKey: string; streamId: string };
  output: Response<204> | Response<403, UnauthorizedMessageBody>;
};

export const makeDeleteStreamRecord =
  (env: DomainEnv) =>
  (input: DeleteStreamRecord['input']): DeleteStreamRecord => ({
    type: 'DeleteStreamRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() => ({ statusCode: 204 as const, returned: undefined })),
      E.toUnion
    ),
    loggedAt: env.dateGenerator(),
  });
