import { Response } from './types';
import { Repository } from './Repository';
import { PreLoadResponseBody } from '../generated/definitions/PreLoadResponseBody';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRequest } from '../generated/definitions/NewNotificationRequest';
import { NewNotificationResponse } from '../generated/definitions/NewNotificationResponse';

export type NewNotificationRecord = {
  type: 'NewNotificationRecord';
  input: { apiKey: ApiKey; body: NewNotificationRequest };
  output: Response<202, NewNotificationResponse> | Response<401>;
};

export type NewNotificationRepository = Repository<NewNotificationRecord>;
