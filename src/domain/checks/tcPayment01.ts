import { Group } from '../reportengine/reportengine';

export const tcPayment01 = Group({
  'Create a notification request providing the same sender and creator': Group({
    'Have you filled at least one recipient where the field payment.creditorTaxId is the same as the senderTaxId?':
      () => true,
  }),
  'Request the notification price': Group({
    'Have you called the endpoint to get the price?': () => true,
    'Have you provided the payment details from the notification previously created?': () => true,
  }),
});
