import { Group } from '../reportengine/reportengine';
import * as NewNotificationRequestRecordChecks from './NewNotificationRequestRecordChecks';
import * as GetNotificationPriceRecordChecks from './GetNotificationPriceRecordChecks';

export const tcCosto01 = Group({
  'Create a notification request providing the same sender and creditor': Group({
    'Have you filled at least one recipient where the field payment.creditorTaxId is the same as the senderTaxId?':
      NewNotificationRequestRecordChecks.atLeastOneNotificationSameSenderAndCreatorC,
  }),
  'Request the notification price': Group({
    'Have you called the endpoint to get the price?':
      GetNotificationPriceRecordChecks.atLeastOneGetNotificationPriceRecordC,
    'Have you provided the payment details from the notification previously created?':
      GetNotificationPriceRecordChecks.atLeastOneGetNotificationPriceRecordMatchingPreviousNotificationRequest,
  }),
});
