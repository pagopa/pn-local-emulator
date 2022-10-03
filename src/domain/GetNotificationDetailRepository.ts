import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import { FullSentNotification } from '../generated/definitions/FullSentNotification';
import { NotificationStatusEnum } from '../generated/definitions/NotificationStatus';
import { PhysicalCommunicationTypeEnum } from '../generated/definitions/NewNotificationRequest';
import { Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { Notification } from './Notification';

export type GetNotificationDetailRecord = {
  type: 'GetNotificationDetailRecord';
  input: { apiKey: ApiKey; iun: Iun };
  output: Response<200, FullSentNotification> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export type GetNotificationDetailRecordRepository = Repository<GetNotificationDetailRecord>;

// TODO: Improve this method
export const makeFullSentNotification = (notification: Notification): FullSentNotification => ({
  ...notification,
  // Momento di ricezione della notifica da parte di PN
  sentAt: new Date(),
  notificationStatus: NotificationStatusEnum.ACCEPTED,
  // elenco degli avanzamenti effettuati dal processo di notifica
  notificationStatusHistory: [],
  // Indica se i documenti notificati sono ancora disponibili.
  documentsAvailable: true,
  cancelledByIun: 'cancelledByIun',
  // elenco dettagliato di tutto ciò che è accaduto durrante il processo di notifica
  timeline: [],
  // Identificativo IPA della PA mittente che ha eseguito l'onborading su SelfCare.
  senderPaId: 'senderPaId',
});
