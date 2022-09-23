import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { FullSentNotification } from '../generated/definitions/FullSentNotification';
import { Response, UnauthorizedMessageBody } from './types';
import { Repository } from './Repository';

export type GetNotificationDetailRecord = {
  type: 'GetNotificationDetailRecord';
  input: { apiKey: ApiKey; iun: Iun };
  output: Response<200, FullSentNotification> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export type GetNotificationDetailRepository = Repository<GetNotificationDetailRecord>;
