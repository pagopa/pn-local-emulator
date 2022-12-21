import { NotificationAttachment } from '../generated/pnapi/NotificationAttachment';
import { NotificationAttachmentDownloadMetadataResponse } from '../generated/pnapi/NotificationAttachmentDownloadMetadataResponse';
import { DomainEnv } from './DomainEnv';

export const makeNotificationAttachmentDownloadMetadataResponse =
  (env: DomainEnv) =>
  (notificationAttachment: NotificationAttachment): NotificationAttachmentDownloadMetadataResponse => ({
    filename: notificationAttachment.ref.key,
    contentType: notificationAttachment.contentType,
    contentLength: 0,
    sha256: notificationAttachment.digests.sha256,
    url: `${env.downloadDocumentURL.href}/${env.sampleStaticPdfFileName}?correlation-id=${env.iunGenerator()}`,
  });
