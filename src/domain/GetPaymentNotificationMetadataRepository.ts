import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type GetPaymentNotificationMetadataRecord = {
  type: 'GetPaymentNotificationMetadataRecord';
  input: { apiKey: ApiKey; iun: Iun; recipientId: number; attachmentName: string };
  // TODO: Response should be NotificationAttachmentDownloadMetadataResponse from another working branch
  output: Response<200, string> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export type GetPaymentNotificationMetadataRepository = Repository<GetPaymentNotificationMetadataRecord>;
