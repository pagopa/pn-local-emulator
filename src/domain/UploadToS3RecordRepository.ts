import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { AmzChecksumSHA256 } from '../generated/definitions/AmzChecksumSHA256';
import { AmzMetaSecret } from '../generated/definitions/AmzMetaSecret';
import { AmzSdkChecksumAlg } from '../generated/definitions/AmzSdkChecksumAlg';
import { AmzDocumentKey } from '../generated/definitions/AmzDocumentKey';
import { AmzVersionId } from '../generated/definitions/AmzVersionId';
import { Response } from './types';
import { AllRecord, Repository } from './Repository';
import { matchProperties, PreLoadRecord } from './PreLoadRepository';

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

export const matchAnyPreLoadRecord =
  (preLoadRecordList: ReadonlyArray<PreLoadRecord>) =>
  (uploadToS3Record: UploadToS3Record): boolean =>
    uploadToS3Record.output.statusCode === 200 &&
    pipe(
      preLoadRecordList,
      RA.exists(
        // TODO: Add insert date and check that uploadToS3Record.createdAt is bigger than the one of preLoadRecord
        matchProperties(uploadToS3Record.input.checksum, uploadToS3Record.input.secret, uploadToS3Record.input.key)
      )
    );
