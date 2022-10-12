import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { NotificationAttachmentDownloadMetadataResponse } from '../generated/definitions/NotificationAttachmentDownloadMetadataResponse';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type GetPaymentNotificationMetadataRecord = {
  type: 'GetPaymentNotificationMetadataRecord';
  input: { apiKey: ApiKey; iun: Iun; recipientId: number; attachmentName: string };
  output:
    | Response<200, NotificationAttachmentDownloadMetadataResponse>
    | Response<403, UnauthorizedMessageBody>
    | Response<404>;
};

export type GetPaymentNotificationMetadataRepository = Repository<GetPaymentNotificationMetadataRecord>;
