import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { last } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import { UploadToS3RecordRepository } from '../domain/UploadToS3RecordRepository';
import { AmzChecksumSHA256 } from '../generated/definitions/AmzChecksumSHA256';
import { AmzMetaSecret } from '../generated/definitions/AmzMetaSecret';
import { AmzSdkChecksumAlg } from '../generated/definitions/AmzSdkChecksumAlg';
import { AmzVersionId } from '../generated/definitions/AmzVersionId';
import { AmzDocumentKey } from '../generated/definitions/AmzDocumentKey';

export const UploadToS3UseCase =
  (uploadToS3Repository: UploadToS3RecordRepository) =>
  (key: AmzDocumentKey) =>
  (checksumAlg: AmzSdkChecksumAlg) =>
  (secret: AmzMetaSecret) =>
  (checksum: AmzChecksumSHA256): TE.TaskEither<Error, AmzVersionId> => {
    const input = { key, checksumAlg, secret, checksum };
    const output = { statusCode: 200 as const, returned: Math.random() };
    return pipe(
      uploadToS3Repository.insert({ type: 'UploadToS3Record', input, output }),
      // TODO: fix race condition
      TE.map((record) => last(record).output.returned)
    );
  };

export type UploadToS3UseCase = ReturnType<typeof UploadToS3UseCase>;
