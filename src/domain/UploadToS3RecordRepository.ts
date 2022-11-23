import * as O from 'fp-ts/Option';
import { AmzChecksumSHA256 } from '../generated/definitions/AmzChecksumSHA256';
import { AmzMetaSecret } from '../generated/definitions/AmzMetaSecret';
import { AmzSdkChecksumAlg } from '../generated/definitions/AmzSdkChecksumAlg';
import { AmzDocumentKey } from '../generated/definitions/AmzDocumentKey';
import { AmzVersionId } from '../generated/definitions/AmzVersionId';
import { Response } from './types';
import { AllRecord, AuditRecord, Repository } from './Repository';

export type UploadToS3Record = AuditRecord & {
  type: 'UploadToS3Record';
  input: {
    url: string;
    key: AmzDocumentKey;
    checksumAlg?: AmzSdkChecksumAlg;
    secret: AmzMetaSecret;
    checksum: AmzChecksumSHA256;
    computedSha256: string;
  };
  output: Response<200, AmzVersionId>;
};

export const isUploadToS3Record = (record: AllRecord): O.Option<UploadToS3Record> =>
  record.type === 'UploadToS3Record' ? O.some(record) : O.none;

export type UploadToS3RecordRepository = Repository<UploadToS3Record>;
