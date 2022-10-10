import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { NotificationAttachmentDownloadMetadataResponse } from '../generated/definitions/NotificationAttachmentDownloadMetadataResponse';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type GetNotificationDocumentMetadataRecord = {
  type: 'GetNotificationDocumentMetadataRecord';
  input: { apiKey: ApiKey; iun: Iun; docIdx: number };
  output:
    | Response<200, NotificationAttachmentDownloadMetadataResponse>
    | Response<403, UnauthorizedMessageBody>
    | Response<404>;
};

export type GetNotificationDocumentMetadataRecordRepository = Repository<GetNotificationDocumentMetadataRecord>;
