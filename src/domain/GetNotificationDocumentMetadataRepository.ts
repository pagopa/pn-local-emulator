import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { NotificationAttachmentDownloadMetadataResponse } from '../generated/definitions/NotificationAttachmentDownloadMetadataResponse';
import { AuditRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { Notification } from './Notification';
import { DomainEnv } from './DomainEnv';

export type GetNotificationDocumentMetadataRecord = AuditRecord & {
  type: 'GetNotificationDocumentMetadataRecord';
  input: { apiKey: ApiKey; iun: Iun; docIdx: number };
  output:
    | Response<200, NotificationAttachmentDownloadMetadataResponse>
    | Response<403, UnauthorizedMessageBody>
    | Response<404>;
};

export const makeNotificationAttachmentDownloadMetadataResponse =
  (env: DomainEnv) =>
  (document: Notification['documents'][0]): NotificationAttachmentDownloadMetadataResponse => ({
    filename: document.ref.key,
    contentType: document.contentType,
    contentLength: 0,
    sha256: document.digests.sha256,
    url: `${env.downloadDocumentURL.href}/${env.sampleStaticPdfFileName}`,
  });

export type GetNotificationDocumentMetadataRecordRepository = Repository<GetNotificationDocumentMetadataRecord>;
