import { Iun } from '../generated/definitions/Iun';
import { LegalFactCategory } from '../generated/definitions/LegalFactCategory';
import { LegalFactDownloadMetadataResponse } from '../generated/definitions/LegalFactDownloadMetadataResponse';
import { LegalFactId } from '../generated/definitions/LegalFactId';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type LegalFactDownloadMetadataRecord = {
  type: 'LegalFactDownloadMetadataRecord';
  input: { legalFactType: LegalFactCategory; legalFactId: LegalFactId; iun: Iun };
  output: Response<200, LegalFactDownloadMetadataResponse> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export type LegalFactDownloadMetadataRecordRepository = Repository<LegalFactDownloadMetadataRecord>;
