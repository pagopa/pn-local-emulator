import * as O from 'fp-ts/Option';
import { AmzChecksumSHA256 } from '../generated/internalapi/AmzChecksumSHA256';
import { AmzMetaSecret } from '../generated/internalapi/AmzMetaSecret';
import { AmzSdkChecksumAlg } from '../generated/internalapi/AmzSdkChecksumAlg';
import { AmzDocumentKey } from '../generated/internalapi/AmzDocumentKey';
import { AmzVersionId } from '../generated/internalapi/AmzVersionId';
import { Response } from './types';
import { AllRecord, AuditRecord } from './Repository';
import { DomainEnv } from './DomainEnv';

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

export const makeUploadToS3Record =
  (env: DomainEnv) =>
  (input: UploadToS3Record['input']): UploadToS3Record => ({
    type: 'UploadToS3Record',
    input,
    output: {
      statusCode: 200,
      returned: env.dateGenerator().getTime(),
    },
    loggedAt: env.dateGenerator(),
  });
