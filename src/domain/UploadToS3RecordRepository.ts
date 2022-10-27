import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { Predicate } from 'fp-ts/lib/Predicate';
import { AmzChecksumSHA256 } from '../generated/definitions/AmzChecksumSHA256';
import { AmzMetaSecret } from '../generated/definitions/AmzMetaSecret';
import { AmzSdkChecksumAlg } from '../generated/definitions/AmzSdkChecksumAlg';
import { AmzDocumentKey } from '../generated/definitions/AmzDocumentKey';
import { AmzVersionId } from '../generated/definitions/AmzVersionId';
import { Response } from './types';
import { AllRecord, Repository } from './Repository';
import { PreLoadRecord } from './PreLoadRepository';

export type UploadToS3Record = {
  type: 'UploadToS3Record';
  input: {
    key: AmzDocumentKey;
    checksumAlg?: AmzSdkChecksumAlg;
    secret: AmzMetaSecret;
    checksum: AmzChecksumSHA256;
  };
  output: Response<200, AmzVersionId>;
};

export const isUploadToS3Record = (record: AllRecord): O.Option<UploadToS3Record> =>
  record.type === 'UploadToS3Record' ? O.some(record) : O.none;

export type UploadToS3RecordRepository = Repository<UploadToS3Record>;

// checks ///////////////////////////////////////////////////////////////////

export const oneRefersToOther = (preLoadRecord: PreLoadRecord, uploadToS3Record: UploadToS3Record): boolean =>
  preLoadRecord.output.statusCode === 200 &&
  pipe(
    RA.zip(preLoadRecord.output.returned)(preLoadRecord.input.body),
    RA.some(
      ([body, result]) =>
        // TODO: Add insert date and check that uploadToS3Record.createdAt is bigger than the one of preLoadRecord
        body.sha256 === uploadToS3Record.input.checksum &&
        result.secret === uploadToS3Record.input.secret &&
        result.key === uploadToS3Record.input.key
    )
  );

export const existsUploadToS3RecordWithSameVersionToken =
  (versionToken: string | undefined): Predicate<UploadToS3Record> =>
  (record: UploadToS3Record) =>
    record.output.returned.toString() === versionToken;

export const existsUploadToS3RecordWithSameDocumentKey =
  (documentKey: string | undefined): Predicate<UploadToS3Record> =>
  (uploadToS3Record: UploadToS3Record) =>
    uploadToS3Record.input.key === documentKey;
