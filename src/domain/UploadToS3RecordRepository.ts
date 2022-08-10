import { AmzChecksumSHA256 } from '../generated/definitions/AmzChecksumSHA256';
import { AmzMetaSecret } from '../generated/definitions/AmzMetaSecret';
import { AmzSdkChecksumAlg } from '../generated/definitions/AmzSdkChecksumAlg';
import { AmzDocumentKey } from '../generated/definitions/AmzDocumentKey';
import { AmzVersionId } from '../generated/definitions/AmzVersionId';
import { Response } from './types';
import { Repository } from './Repository';

export type UploadToS3Record = {
  type: 'UploadToS3Record';
  input: {
    key: AmzDocumentKey;
    checksumAlg: AmzSdkChecksumAlg;
    secret: AmzMetaSecret;
    checksum: AmzChecksumSHA256;
  };
  output: Response<200, AmzVersionId>;
};

export type UploadToS3RecordRepository = Repository<UploadToS3Record>;
