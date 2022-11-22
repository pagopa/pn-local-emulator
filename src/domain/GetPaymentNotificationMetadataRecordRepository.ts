import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { NotificationAttachmentDownloadMetadataResponse } from '../generated/definitions/NotificationAttachmentDownloadMetadataResponse';
import { NotificationPaymentAttachment } from '../generated/definitions/NotificationPaymentAttachment';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type GetPaymentNotificationMetadataRecord = AuditRecord & {
  type: 'GetPaymentNotificationMetadataRecord';
  input: { apiKey: ApiKey; iun: Iun; recipientId: number; attachmentName: string };
  output:
    | Response<200, NotificationAttachmentDownloadMetadataResponse>
    | Response<403, UnauthorizedMessageBody>
    | Response<404>;
};

export type GetPaymentNotificationMetadataRecordRepository = Repository<GetPaymentNotificationMetadataRecord>;

export const makePaymentNotificationAttachmentDownloadMetadataResponse =
  (env: DomainEnv) =>
  (paymentNotificationAttachment: NotificationPaymentAttachment): NotificationAttachmentDownloadMetadataResponse => ({
    filename: paymentNotificationAttachment.ref.key,
    contentType: paymentNotificationAttachment.contentType,
    contentLength: 0,
    sha256: paymentNotificationAttachment.digests.sha256,
    url: `${env.downloadDocumentURL.href}/${env.sampleStaticPdfFileName}`,
  });
