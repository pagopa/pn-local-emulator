import crypto from 'crypto';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { makeUploadToS3Record, UploadToS3Record } from '../domain/UploadToS3Record';
import { SystemEnv } from './SystemEnv';

const computeSha256 = (bytes: Buffer) => crypto.createHash('sha256').update(bytes).digest('base64');

export const UploadToS3UseCase =
  (env: SystemEnv) =>
  (url: string) =>
  (key: UploadToS3Record['input']['key']) =>
  (checksumAlg?: UploadToS3Record['input']['checksumAlg']) =>
  (secret: UploadToS3Record['input']['secret']) =>
  (checksum: UploadToS3Record['input']['checksum']) =>
  (documentAsBytes: Buffer): TE.TaskEither<Error, UploadToS3Record['output']> =>
    pipe(
      makeUploadToS3Record(env)({
        key,
        url,
        checksumAlg,
        secret,
        checksum,
        computedSha256: computeSha256(documentAsBytes),
      }),
      env.recordRepository.insert,
      TE.map(({ output }) => output)
    );

export type UploadToS3UseCase = ReturnType<typeof UploadToS3UseCase>;
