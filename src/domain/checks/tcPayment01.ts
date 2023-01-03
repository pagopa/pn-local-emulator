import { Group } from '../reportengine/reportengine';

export const tcPayment01 = Group({
  'Request the notification price of a notification with the same sender and creditor': Group({
    'Have you created a notification with the following constraints?': Group({
      'Have you filled at least one recipient where the field payment.creditorTaxId is the same as the senderTaxId?':
        () => true,
    }),
    'Have you called the endpoint to get the price?': () => true,
  }),
});
