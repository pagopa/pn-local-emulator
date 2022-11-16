import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { LegalFactCategory } from '../generated/definitions/LegalFactCategory';
import { LegalFactDownloadMetadataResponse } from '../generated/definitions/LegalFactDownloadMetadataResponse';
import { LegalFactId } from '../generated/definitions/LegalFactId';
import { DomainEnv } from './DomainEnv';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type LegalFactDownloadMetadataRecord = {
  type: 'LegalFactDownloadMetadataRecord';
  input: { apiKey: ApiKey; legalFactType: LegalFactCategory; legalFactId: LegalFactId; iun: Iun };
  output: Response<200, LegalFactDownloadMetadataResponse> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export type LegalFactDownloadMetadataRecordRepository = Repository<LegalFactDownloadMetadataRecord>;

export const makeLegalFactDownloadMetadataResponse = (env: DomainEnv): LegalFactDownloadMetadataResponse => ({
  filename: 'dummy-filename',
  contentLength: 10,
  url: `${env.downloadDocumentURL.href}/${env.sampleStaticPdfFileName}`,
});
