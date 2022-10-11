import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { NotificationAttachmentDownloadMetadataResponse } from '../generated/definitions/NotificationAttachmentDownloadMetadataResponse';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { Notification } from './Notification';

export type GetNotificationDocumentMetadataRecord = {
  type: 'GetNotificationDocumentMetadataRecord';
  input: { apiKey: ApiKey; iun: Iun; docIdx: number };
  output:
    | Response<200, NotificationAttachmentDownloadMetadataResponse>
    | Response<403, UnauthorizedMessageBody>
    | Response<404>;
};

export const makeNotificationAttachmentDownloadMetadataResponse = (
  document: Notification['documents'][0]
): NotificationAttachmentDownloadMetadataResponse => ({
  filename: document.ref.key,
  contentType: document.contentType,
  contentLength: 0,
  sha256: document.digests.sha256,
});

export type GetNotificationDocumentMetadataRecordRepository = Repository<GetNotificationDocumentMetadataRecord>;
